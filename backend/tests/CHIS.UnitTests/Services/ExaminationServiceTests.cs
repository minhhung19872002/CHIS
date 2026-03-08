using CHIS.Application.DTOs;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CHIS.UnitTests.Services;

public class ExaminationServiceTests : IDisposable
{
    private readonly CHISDbContext _db;
    private readonly UnitOfWork _uow;
    private readonly ExaminationService _sut;

    public ExaminationServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _uow = new UnitOfWork(_db);
        _sut = new ExaminationService(_db, _uow);
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    private async Task<(Patient patient, MedicalRecord record, Room room, User doctor)> SeedExamDataAsync()
    {
        var patient = TestHelper.CreatePatient();
        var room = TestHelper.CreateRoom();
        var doctor = TestHelper.CreateUser(username: "doctor1", fullName: "Dr. Nguyen");

        await _db.Patients.AddAsync(patient);
        await _db.Rooms.AddAsync(room);
        await _db.Users.AddAsync(doctor);

        var record = new MedicalRecord
        {
            RecordNumber = "BA001",
            PatientId = patient.Id,
            RecordDate = DateTime.UtcNow,
            Status = 0
        };
        await _db.MedicalRecords.AddAsync(record);
        await _db.SaveChangesAsync();

        return (patient, record, room, doctor);
    }

    [Fact]
    public async Task CreateAsync_CreatesExamAndQueueTicket()
    {
        var (patient, record, room, doctor) = await SeedExamDataAsync();

        var result = await _sut.CreateAsync(new CreateExaminationDto
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            RoomId = room.Id,
            DoctorId = doctor.Id,
            ChiefComplaint = "Dau dau"
        });

        result.PatientId.Should().Be(patient.Id);
        result.ChiefComplaint.Should().Be("Dau dau");
        result.Status.Should().Be(0);

        var tickets = await _db.QueueTickets.Where(q => q.PatientId == patient.Id).ToListAsync();
        tickets.Should().ContainSingle();
        tickets[0].QueueNumber.Should().Be(1);
        tickets[0].Status.Should().Be(0);
    }

    [Fact]
    public async Task CreateAsync_WithoutRoom_NoQueueTicket()
    {
        var (patient, record, _, _) = await SeedExamDataAsync();

        var result = await _sut.CreateAsync(new CreateExaminationDto
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            ChiefComplaint = "Test"
        });

        result.Should().NotBeNull();
        var tickets = await _db.QueueTickets.ToListAsync();
        tickets.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingExam_ReturnsDto()
    {
        var (patient, record, room, doctor) = await SeedExamDataAsync();
        var exam = new Examination
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            RoomId = room.Id,
            DoctorId = doctor.Id,
            ExamDate = DateTime.UtcNow,
            ChiefComplaint = "Sot",
            Status = 0
        };
        await _db.Examinations.AddAsync(exam);
        await _db.SaveChangesAsync();

        var result = await _sut.GetByIdAsync(exam.Id);

        result.Id.Should().Be(exam.Id);
        result.PatientName.Should().Be(patient.FullName);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.GetByIdAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task SearchAsync_ByKeyword_FiltersResults()
    {
        var p1 = TestHelper.CreatePatient("Nguyen Van A", "BN001");
        var p2 = TestHelper.CreatePatient("Tran Thi B", "BN002");
        await _db.Patients.AddRangeAsync(p1, p2);
        var r1 = new MedicalRecord { RecordNumber = "BA001", PatientId = p1.Id, RecordDate = DateTime.UtcNow, Status = 0 };
        var r2 = new MedicalRecord { RecordNumber = "BA002", PatientId = p2.Id, RecordDate = DateTime.UtcNow, Status = 0 };
        await _db.MedicalRecords.AddRangeAsync(r1, r2);
        await _db.Examinations.AddRangeAsync(
            new Examination { PatientId = p1.Id, MedicalRecordId = r1.Id, ExamDate = DateTime.UtcNow, Status = 0 },
            new Examination { PatientId = p2.Id, MedicalRecordId = r2.Id, ExamDate = DateTime.UtcNow, Status = 0 }
        );
        await _db.SaveChangesAsync();

        var result = await _sut.SearchAsync(new ExaminationSearchDto { Keyword = "Nguyen", PageSize = 20 });

        result.Items.Should().ContainSingle();
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFieldsAndSetsStatusToInProgress()
    {
        var (patient, record, room, doctor) = await SeedExamDataAsync();
        var exam = new Examination
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            ExamDate = DateTime.UtcNow,
            Status = 0
        };
        await _db.Examinations.AddAsync(exam);
        await _db.SaveChangesAsync();

        var result = await _sut.UpdateAsync(exam.Id, new UpdateExaminationDto
        {
            ChiefComplaint = "Updated",
            MainDiagnosis = "Cam cum",
            MainIcdCode = "J06",
            Temperature = 38.5m
        });

        result.ChiefComplaint.Should().Be("Updated");
        result.MainDiagnosis.Should().Be("Cam cum");
        result.Status.Should().Be(1);
    }

    [Fact]
    public async Task CompleteExaminationAsync_SetsStatusToCompleted()
    {
        var (patient, record, room, _) = await SeedExamDataAsync();
        var exam = new Examination
        {
            PatientId = patient.Id,
            MedicalRecordId = record.Id,
            RoomId = room.Id,
            ExamDate = DateTime.UtcNow,
            Status = 1
        };
        await _db.Examinations.AddAsync(exam);
        var ticket = new QueueTicket
        {
            PatientId = patient.Id,
            ExaminationId = exam.Id,
            RoomId = room.Id,
            TicketCode = "STT001",
            QueueNumber = 1,
            QueueType = 1,
            Status = 2
        };
        await _db.QueueTickets.AddAsync(ticket);
        await _db.SaveChangesAsync();

        await _sut.CompleteExaminationAsync(exam.Id);

        var updated = await _db.Examinations.FindAsync(exam.Id);
        updated!.Status.Should().Be(2);

        var updatedTicket = await _db.QueueTickets.FindAsync(ticket.Id);
        updatedTicket!.Status.Should().Be(3);
    }

    [Fact]
    public async Task CancelQueueTicketAsync_SetsCancelledStatus()
    {
        var patient = TestHelper.CreatePatient();
        var room = TestHelper.CreateRoom();
        await _db.Patients.AddAsync(patient);
        await _db.Rooms.AddAsync(room);
        var ticket = new QueueTicket
        {
            PatientId = patient.Id,
            RoomId = room.Id,
            TicketCode = "STT001",
            QueueNumber = 1,
            QueueType = 1,
            Status = 0
        };
        await _db.QueueTickets.AddAsync(ticket);
        await _db.SaveChangesAsync();

        await _sut.CancelQueueTicketAsync(ticket.Id);

        var updated = await _db.QueueTickets.FindAsync(ticket.Id);
        updated!.Status.Should().Be(4);
    }

    [Fact]
    public async Task CancelQueueTicketAsync_NonExistent_ThrowsNotFound()
    {
        var act = () => _sut.CancelQueueTicketAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}
