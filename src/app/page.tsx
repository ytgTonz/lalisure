import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard to show the completed work
  redirect('/dashboard');
}
