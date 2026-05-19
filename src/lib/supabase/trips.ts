"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Contribution, Expense, ExpenseCategory } from "@/types";

export type TripRow = {
  id: string;
  title: string;
  owner_id: string;
  invite_code: string;
  qr_image: string | null;
  upi_id: string | null;
  created_at: string;
};

export type TripSummary = TripRow & {
  member_count: number;
  total_collected: number;
  total_spent: number;
};

type ContributionRow = {
  id: string;
  trip_id: string;
  contributor_name: string;
  amount: number;
  note: string | null;
  created_at: string;
};

type ExpenseRow = {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  category: string;
  description: string | null;
  created_at: string;
};

function mapContribution(r: ContributionRow): Contribution {
  return {
    id: r.id,
    name: r.contributor_name,
    amount: Number(r.amount),
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}

function mapExpense(r: ExpenseRow): Expense {
  return {
    id: r.id,
    title: r.title,
    amount: Number(r.amount),
    category: r.category as ExpenseCategory,
    description: r.description ?? undefined,
    createdAt: r.created_at,
  };
}

async function currentUserId(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return data.user.id;
}

export async function listMyTrips(): Promise<TripSummary[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      `
      id, title, owner_id, invite_code, qr_image, upi_id, created_at,
      members:trip_members(user_id),
      contributions(amount),
      expenses(amount)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  type Embedded = TripRow & {
    members: { user_id: string }[] | null;
    contributions: { amount: number }[] | null;
    expenses: { amount: number }[] | null;
  };

  return ((data ?? []) as Embedded[]).map((t) => ({
    id: t.id,
    title: t.title,
    owner_id: t.owner_id,
    invite_code: t.invite_code,
    qr_image: t.qr_image,
    upi_id: t.upi_id,
    created_at: t.created_at,
    member_count: t.members?.length ?? 0,
    total_collected: (t.contributions ?? []).reduce((s, c) => s + Number(c.amount), 0),
    total_spent: (t.expenses ?? []).reduce((s, e) => s + Number(e.amount), 0),
  }));
}

export async function createTrip(title: string): Promise<{ id: string; invite_code: string }> {
  const supabase = getSupabaseBrowserClient();
  const ownerId = await currentUserId();
  const { data, error } = await supabase
    .from("trips")
    .insert({ title: title.trim(), owner_id: ownerId })
    .select("id, invite_code")
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Failed to create trip");
  return { id: data.id, invite_code: data.invite_code };
}

export async function joinTrip(inviteCode: string): Promise<{ id: string }> {
  const supabase = getSupabaseBrowserClient();
  const code = inviteCode.trim().toUpperCase();

  const { data: trip, error: lookupErr } = await supabase
    .from("trips")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();

  if (lookupErr) throw new Error(lookupErr.message);
  if (!trip) throw new Error("Invalid invite code");

  const userId = await currentUserId();
  const { error: insertErr } = await supabase
    .from("trip_members")
    .insert({ trip_id: trip.id, user_id: userId });

  if (insertErr) {
    if (insertErr.code === "23505") {
      return { id: trip.id };
    }
    throw new Error(insertErr.message);
  }
  return { id: trip.id };
}

export async function getTrip(tripId: string): Promise<TripRow | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("trips")
    .select("id, title, owner_id, invite_code, qr_image, upi_id, created_at")
    .eq("id", tripId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as TripRow) ?? null;
}

export async function updateTrip(
  tripId: string,
  patch: { title?: string; qr_image?: string | null; upi_id?: string | null }
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("trips").update(patch).eq("id", tripId);
  if (error) throw new Error(error.message);
}

export async function leaveTrip(tripId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const userId = await currentUserId();
  const { error } = await supabase
    .from("trip_members")
    .delete()
    .eq("trip_id", tripId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function listContributions(tripId: string): Promise<Contribution[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("contributions")
    .select("id, trip_id, contributor_name, amount, note, created_at")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ContributionRow[]).map(mapContribution);
}

export async function addContribution(input: {
  tripId: string;
  name: string;
  amount: number;
  note?: string;
}): Promise<Contribution> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("contributions")
    .insert({
      trip_id: input.tripId,
      contributor_name: input.name.trim(),
      amount: input.amount,
      note: input.note?.trim() || null,
    })
    .select("id, trip_id, contributor_name, amount, note, created_at")
    .single();

  if (error) throw new Error(error.message);
  return mapContribution(data as ContributionRow);
}

export async function updateContribution(
  id: string,
  patch: { name?: string; amount?: number; note?: string | null }
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.contributor_name = patch.name;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.note !== undefined) dbPatch.note = patch.note;
  const { error } = await supabase.from("contributions").update(dbPatch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteContribution(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("contributions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listExpenses(tripId: string): Promise<Expense[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("id, trip_id, title, amount, category, description, created_at")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ExpenseRow[]).map(mapExpense);
}

export async function addExpense(input: {
  tripId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
}): Promise<Expense> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      trip_id: input.tripId,
      title: input.title.trim(),
      amount: input.amount,
      category: input.category,
      description: input.description?.trim() || null,
    })
    .select("id, trip_id, title, amount, category, description, created_at")
    .single();

  if (error) throw new Error(error.message);
  return mapExpense(data as ExpenseRow);
}

export async function updateExpense(
  id: string,
  patch: {
    title?: string;
    amount?: number;
    category?: ExpenseCategory;
    description?: string | null;
  }
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("expenses").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
