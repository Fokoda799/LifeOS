import { MoneyDataPurger } from './money-data-purger';

describe('MoneyDataPurger', () => {
  it('erases transactions before the accounts and categories they reference', async () => {
    const order: string[] = [];
    const step = (name: string) => ({
      removeAllForUser: vi.fn().mockImplementation(() => {
        order.push(name);
        return Promise.resolve();
      }),
    });
    const registry = { register: vi.fn() };
    const purger = new MoneyDataPurger(
      registry as never,
      step('accounts') as never,
      step('categories') as never,
      step('transactions') as never,
    );
    purger.onModuleInit();
    expect(registry.register).toHaveBeenCalledWith(purger);

    await purger.purge('u1');
    expect(order[0]).toBe('transactions');
    expect(order).toHaveLength(3);
  });
});
