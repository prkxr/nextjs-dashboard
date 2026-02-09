import CreateCustomerForm from '@/app/ui/customers/create-form';
import { lusitana } from '@/app/ui/fonts';

export default function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Create Customer
      </h1>
      <CreateCustomerForm />
    </main>
  );
}

