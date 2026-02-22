import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { createSupabaseServerClient } from './supabase/server';

async function getCurrentUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Auth Error:', error.message);
  }

  return user?.id ?? null;
}

export async function fetchRevenue() {
  try {
    const supabase = await createSupabaseServerClient(); // ✅ fixed
    const { data, error } = await supabase
      .from('revenue')
      .select('*')
      .order('month', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Revenue[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createSupabaseServerClient(); // ✅ fixed
    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
        id,
        amount_cents,
        customers:customers (
          name,
          image_url,
          email
        )
      `,
      )
      .eq('owner_id', ownerId)
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    const latestInvoices: LatestInvoiceRaw[] = (data ?? []).map(
      (row: any) => ({
        id: row.id,
        amount: row.amount_cents,
        name: row.customers?.name ?? '',
        image_url: row.customers?.image_url ?? '',
        email: row.customers?.email ?? '',
      }),
    );

    return latestInvoices.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createSupabaseServerClient(); // ✅ fixed

    const [
      { count: invoiceCount, error: invoicesError },
      { count: customerCount, error: customersError },
      { data: invoiceSums, error: sumsError },
    ] = await Promise.all([
      supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId),
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId),
      supabase
        .from('invoices')
        .select('status, amount_cents')
        .eq('owner_id', ownerId),
    ]);

    if (invoicesError || customersError || sumsError) {
      throw invoicesError || customersError || sumsError;
    }

    const numberOfInvoices = invoiceCount ?? 0;
    const numberOfCustomers = customerCount ?? 0;

    let paidTotal = 0;
    let pendingTotal = 0;
    (invoiceSums ?? []).forEach((invoice: any) => {
      if (invoice.status === 'paid') {
        paidTotal += invoice.amount_cents;
      } else if (invoice.status === 'pending') {
        pendingTotal += invoice.amount_cents;
      }
    });

    const totalPaidInvoices = formatCurrency(paidTotal);
    const totalPendingInvoices = formatCurrency(pendingTotal);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createSupabaseServerClient(); // ✅ fixed
    let queryBuilder = supabase
      .from('invoices')
      .select(
        `
        id,
        customer_id,
        amount_cents,
        date,
        status,
        customers:customers (
          name,
          email,
          image_url
        )
      `,
      )
      .eq('owner_id', ownerId)
      .order('date', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (query) {
      queryBuilder = queryBuilder.or(
        `status.ilike.%${query}%,date.ilike.%${query}%`,
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    const invoices: InvoicesTable[] = (data ?? []).map((row: any) => ({
      id: row.id,
      amount: row.amount_cents,
      date: row.date,
      status: row.status,
      name: row.customers?.name ?? '',
      email: row.customers?.email ?? '',
      image_url: row.customers?.image_url ?? '',
      customer_id: row.customer_id,
    }));

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createSupabaseServerClient(); // ✅ fixed
    let queryBuilder = supabase
      .from('invoices')
      .select('id', { count: 'exact', head: false })
      .eq('owner_id', ownerId);

    if (query) {
      queryBuilder = queryBuilder.or(
        `status.ilike.%${query}%,date.ilike.%${query}%`,
      );
    }

    const { count, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createSupabaseServerClient(); // ✅ fixed

    const { data, error } = await supabase
      .from('invoices')
      .select('id, customer_id, amount_cents, status')
      .eq('owner_id', ownerId)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return undefined;
    }

    const invoice: InvoiceForm = {
      id: data.id,
      customer_id: data.customer_id,
      amount: data.amount_cents / 100,
      status: data.status,
    };

    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomerById(id: string) {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createSupabaseServerClient(); // ✅ fixed
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('owner_id', ownerId)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ?? undefined;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer.');
  }
}

export async function fetchCustomers() {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createSupabaseServerClient(); // ✅ fixed
    const { data, error } = await supabase
      .from('customers')
      .select('id, name')
      .eq('owner_id', ownerId)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as CustomerField[];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createSupabaseServerClient(); // ✅ already correct

    let customerQuery = supabase
      .from('customers')
      .select('id, name, email')
      .eq('owner_id', ownerId);

    if (query && query.trim()) {
      const searchPattern = `%${query.trim()}%`;
      customerQuery = customerQuery.or(
        `name.ilike.${searchPattern},email.ilike.${searchPattern}`,
      );
    }

    const { data: customersData, error: customersError } = await customerQuery.order('name', { ascending: true });

    if (customersError) {
      throw customersError;
    }

    if (!customersData || customersData.length === 0) {
      return [];
    }

    const customerIds = customersData.map((c: any) => c.id);
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('customer_id, amount_cents, status')
      .eq('owner_id', ownerId)
      .in('customer_id', customerIds);

    if (invoicesError) {
      console.error('Invoices fetch error (non-fatal):', invoicesError);
    }

    const invoicesByCustomer = new Map<string, any[]>();
    (invoicesData ?? []).forEach((invoice: any) => {
      const customerId = invoice.customer_id;
      if (!invoicesByCustomer.has(customerId)) {
        invoicesByCustomer.set(customerId, []);
      }
      invoicesByCustomer.get(customerId)!.push(invoice);
    });

    const customers  = customersData.map((customer: any) => {
      const invoices = invoicesByCustomer.get(customer.id) ?? [];
      let totalPending = 0;
      let totalPaid = 0;

      invoices.forEach((invoice: any) => {
        if (invoice.status === 'pending') {
          totalPending += invoice.amount_cents;
        } else if (invoice.status === 'paid') {
          totalPaid += invoice.amount_cents;
        }
      });

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        total_invoices: invoices.length,
        total_pending: totalPending,
        total_paid: totalPaid,
      };
    });

    return customers.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
