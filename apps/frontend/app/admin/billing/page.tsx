import { redirect } from 'next/navigation';

export default function AdminBillingRedirect() {
  redirect('/admin/billing/tariffs');
}

