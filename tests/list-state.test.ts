import { describe, expect, it } from 'vitest';
import { listQuery, updateListState } from '@/lib/list-state';
describe('URL list state', () => {
  it('preserves unrelated filters while resetting pagination', () => {
    const p = new URLSearchParams(
      updateListState(
        'page=7&status=stable&sort=name&search=old',
        'search',
        'New name',
      ),
    );
    expect(p.get('page')).toBeNull();
    expect(p.get('status')).toBe('stable');
    expect(p.get('sort')).toBe('name');
    expect(p.get('search')).toBe('New name');
  });
  it('changes pages without losing filters', () =>
    expect(updateListState('status=critical&page=2', 'page', '3')).toBe(
      'status=critical&page=3',
    ));
  it('sends only the supported parameters for a resource', () =>
    expect(
      listQuery(
        new URLSearchParams('page=2&search=test&notesPage=7&unknown=yes'),
        ['page', 'search'],
      ),
    ).toEqual({ page: '2', search: 'test' }));
});
