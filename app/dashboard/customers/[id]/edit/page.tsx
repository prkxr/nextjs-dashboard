import { notFound } from 'next/navigation';
import { lusitana } from '@/app/ui/fonts';
import EditCustomerForm from '@/app/ui/customers/edit-form';
import { fetchCustomerById } from '@/app/lib/data';

export default async function Page({ params }: { params: { id: string } }) {
  const customer = await fetchCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Edit Customer
      </h1>
      <EditCustomerForm customer={customer} />
    </main>
  );
}

