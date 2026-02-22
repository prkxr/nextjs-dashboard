'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase/server';

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, { message: 'Please enter a customer name.' })
    .max(255, { message: 'Name is too long.' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .max(255, { message: 'Email is too long.' }),
});

const CreateCustomerSchema = CustomerFormSchema.omit({ id: true });
const UpdateCustomerSchema = CustomerFormSchema.omit({ id: true });

export type CustomerFormState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

async function ensureProfileForUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  user: { id: string; user_metadata?: { full_name?: string } | null },
) {
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileLookupError) {
    throw profileLookupError;
  }

  if (existingProfile) {
    return;
  }

  const { error: profileInsertError } = await supabase.from('profiles').insert({
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
  });

  if (profileInsertError) {
    console.error('Failed to create profile:', profileInsertError.message);
  }
}

async function getOwnerIdOrThrow() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Auth Error:', error.message);
  }

  if (!user) {
    throw new Error('Not authenticated');
  }
  await ensureProfileForUser(supabase, user);

  return { supabase, ownerId: user.id };
}

export async function createCustomer(
  prevState: CustomerFormState,
  formData: FormData,
) {
  const validatedFields = CreateCustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to create customer.',
    };
  }

  const { supabase, ownerId } = await getOwnerIdOrThrow();
  const { name, email } = validatedFields.data;

  const { error } = await supabase.from('customers').insert({
    owner_id: ownerId,
    name,
    email,
  });

  if (error) {
    console.error('Database Error:', error.message);
    return {
      message: 'Database error. Failed to create customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(
  id: string,
  prevState: CustomerFormState,
  formData: FormData,
) {
  const validatedFields = UpdateCustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to update customer.',
    };
  }

  const { supabase, ownerId } = await getOwnerIdOrThrow();
  const { name, email } = validatedFields.data;

  const { error } = await supabase
    .from('customers')
    .update({
      name,
      email,
    })
    .eq('id', id)
    .eq('owner_id', ownerId);

  if (error) {
    console.error('Database Error:', error.message);
    return {
      message: 'Database error. Failed to update customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string) {
  const { supabase, ownerId } = await getOwnerIdOrThrow();

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('owner_id', ownerId);

  if (error) {
    console.error('Database Error:', error.message);
    throw new Error('Failed to delete customer.');
  }

  revalidatePath('/dashboard/customers');
}