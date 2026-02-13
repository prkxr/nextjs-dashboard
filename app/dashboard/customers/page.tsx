// import { Metadata } from 'next';
// import { lusitana } from '@/app/ui/fonts';
// import CustomersTable from '@/app/ui/customers/table';
// import Search from '@/app/ui/search';
// import { CreateCustomer } from '@/app/ui/customers/buttons';
// import { fetchFilteredCustomers } from '@/app/lib/data';

// export const metadata: Metadata = {
//   title: 'Customers | Invoice Dashboard',
// };

// export default async function Page(props: {
//   searchParams?: Promise<{
//     query?: string;
//   }>;
// }) {
//   const searchParams = await props.searchParams;
//   const query = searchParams?.query || '';

//   const customers = await fetchFilteredCustomers(query);

//   return (
//     <div className="w-full">
//       <div className="flex w-full items-center justify-between">
//         <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
//       </div>
//       <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
//         <Search placeholder="Search customers..." />
//         <CreateCustomer />
//       </div>
//       <div className="mt-6">
//         <CustomersTable customers={customers} />
//       </div>
//     </div>
//   );
// }
// import { Metadata } from 'next';
// import CustomersTable from '@/app/ui/customers/table';
// import { fetchFilteredCustomers } from '@/app/lib/data';

// export const metadata: Metadata = {
//   title: 'Customers | Invoice Dashboard',
// };

// export default async function Page(props: {
//   searchParams?: Promise<{
//     query?: string;
//   }>;
// }) {
//   const searchParams = await props.searchParams;
//   const query = searchParams?.query || '';

//   const customers = await fetchFilteredCustomers(query);

//   return (
//     <div className="w-full">
//       <CustomersTable customers={customers} />
//     </div>
//   );
// }
import { Metadata } from 'next';
import { lusitana } from '@/app/ui/fonts';
import CustomersTable from '@/app/ui/customers/table';
import Search from '@/app/ui/search';
import { CreateCustomer } from '@/app/ui/customers/buttons';

export const metadata: Metadata = {
  title: 'Customers | Invoice Dashboard',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customers..." />
        <CreateCustomer />
      </div>
      <div className="mt-6">
        <CustomersTable query={query} currentPage={currentPage} />
      </div>
    </div>
  );
}