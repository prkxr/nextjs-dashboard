'use client';

import { useEffect, useState, FormEvent } from 'react';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/client';
import { InvoiceComment } from '@/app/lib/definitions';
import { formatDateToLocal } from '@/app/lib/utils';
import { Button } from '@/app/ui/button';

type Props = {
  invoiceId: string;
};

export default function InvoiceComments({ invoiceId }: Props) {
  const [comments, setComments] = useState<InvoiceComment[]>([]);
  const [body, setBody] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      const { data, error } = await supabase
        .from('invoice_comments')
        .select(
          `
          id,
          invoice_id,
          author_id,
          body,
          created_at,
          updated_at,
          profiles:profiles (
            full_name
          )
        `,
        )
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        setError('Failed to load comments.');
      } else {
        const mapped: InvoiceComment[] = (data ?? []).map((row: any) => ({
          id: row.id,
          invoice_id: row.invoice_id,
          author_id: row.author_id,
          body: row.body,
          created_at: row.created_at,
          updated_at: row.updated_at,
          author_name: row.profiles?.full_name ?? 'Unknown',
        }));
        setComments(mapped);
      }

      setLoading(false);
    }

    load();
  }, [invoiceId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('invoice_comments')
      .insert({ invoice_id: invoiceId, body: trimmed });

    if (error) {
      console.error(error);
      setError('Failed to add comment.');
      return;
    }

    setBody('');
    // Reload comments
    const { data, error: reloadError } = await supabase
      .from('invoice_comments')
      .select(
        `
        id,
        invoice_id,
        author_id,
        body,
        created_at,
        updated_at,
        profiles:profiles (
          full_name
        )
      `,
      )
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: true });

    if (!reloadError && data) {
      const mapped: InvoiceComment[] = data.map((row: any) => ({
        id: row.id,
        invoice_id: row.invoice_id,
        author_id: row.author_id,
        body: row.body,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author_name: row.profiles?.full_name ?? 'Unknown',
      }));
      setComments(mapped);
    }
  }

  async function handleStartEdit(comment: InvoiceComment) {
    setEditingId(comment.id);
    setEditingBody(comment.body);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const supabase = createSupabaseBrowserClient();
    const trimmed = editingBody.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('invoice_comments')
      .update({ body: trimmed })
      .eq('id', editingId);

    if (error) {
      console.error(error);
      setError('Failed to update comment.');
      return;
    }

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === editingId ? { ...comment, body: trimmed } : comment,
      ),
    );
    setEditingId(null);
    setEditingBody('');
  }

  async function handleDelete(id: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('invoice_comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      setError('Failed to delete comment.');
      return;
    }

    setComments((prev) => prev.filter((comment) => comment.id !== id));
  }

  return (
    <section className="mt-8 rounded-md bg-gray-50 p-4 md:p-6">
      <h2 className="mb-4 text-lg font-semibold">Comments</h2>
      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const isAuthor = comment.author_id === currentUserId;
            return (
              <li
                key={comment.id}
                className="rounded-md bg-white p-3 text-sm shadow-sm"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">
                    {comment.author_name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateToLocal(comment.created_at)}
                  </span>
                </div>
                {editingId === comment.id && isAuthor ? (
                  <form onSubmit={handleSaveEdit} className="space-y-2">
                    <textarea
                      className="w-full rounded-md border border-gray-200 p-2 text-sm outline-2"
                      rows={3}
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        className="bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:outline-gray-400"
                        onClick={() => {
                          setEditingId(null);
                          setEditingBody('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-gray-800">
                      {comment.body}
                    </p>
                    {isAuthor && (
                      <div className="mt-2 flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          className="text-blue-600 hover:underline"
                          onClick={() => handleStartEdit(comment)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(comment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <form onSubmit={handleCreate} className="mt-4 space-y-2">
        <label htmlFor="new-comment" className="block text-sm font-medium">
          Add a comment
        </label>
        <textarea
          id="new-comment"
          className="w-full rounded-md border border-gray-200 p-2 text-sm outline-2"
          rows={3}
          placeholder="Type your comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit">Post Comment</Button>
        </div>
      </form>
    </section>
  );
}

