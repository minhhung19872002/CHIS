using System.Linq.Expressions;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Data;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly CHISDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(CHISDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id)
        => await _dbSet.FindAsync(id);

    public async Task<List<T>> GetAllAsync()
        => await _dbSet.ToListAsync();

    public async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate)
        => await _dbSet.Where(predicate).ToListAsync();

    public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        => await _dbSet.FirstOrDefaultAsync(predicate);

    public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
        => predicate == null ? await _dbSet.CountAsync() : await _dbSet.CountAsync(predicate);

    public async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        return entity;
    }

    public async Task AddRangeAsync(IEnumerable<T> entities)
        => await _dbSet.AddRangeAsync(entities);

    public void Update(T entity)
        => _dbSet.Update(entity);

    public void Remove(T entity)
    {
        entity.IsDeleted = true;
        _dbSet.Update(entity);
    }

    public IQueryable<T> Query()
        => _dbSet.AsQueryable();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly CHISDbContext _context;

    public UnitOfWork(CHISDbContext context)
    {
        _context = context;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    public void Dispose()
        => _context.Dispose();
}
