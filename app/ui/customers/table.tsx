import Image from 'next/image';
import { CustomersTableType } from '@/app/lib/definitions';
import { formatCurrency } from '@/app/lib/utils';

export default function CustomersTable({
  customers,
}: {
  customers: CustomersTableType[];
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {customers?.map((customer) => (
              <div
                key={customer.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      {customer.image_url && customer.image_url.trim() !== '' ? (
                        <Image
                          src={customer.image_url}
                          className="mr-2 rounded-full"
                          width={28}
                          height={28}
                          alt={`${customer.name}'s profile picture`}
                        />
                      ) : (
                        <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                          <span className="text-xs font-medium text-gray-500">
                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <p>{customer.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between border-b py-4">
                  <div>
                    <p className="text-sm">Pending</p>
                    <p className="font-medium">
                      {formatCurrency(customer.total_pending)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Paid</p>
                    <p className="font-medium">{formatCurrency(customer.total_paid)}</p>
                  </div>
                </div>
                <div className="pt-4 text-sm">
                  <p>{customer.total_invoices} invoices</p>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Image
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Total Invoices
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Total Pending
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Total Paid
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {customers?.map((customer) => (
                <tr
                  key={customer.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p>{customer.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{customer.email}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {customer.image_url && customer.image_url.trim() !== '' ? (
                      <Image
                        src={customer.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${customer.name}'s profile picture`}
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-xs font-medium text-gray-500">
                          {customer.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {customer.total_invoices}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(customer.total_pending)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(customer.total_paid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
