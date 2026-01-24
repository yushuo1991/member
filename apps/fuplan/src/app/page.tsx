import { redirect } from 'next/navigation';

export default function HomePage() {
  // 默认重定向到dashboard
  redirect('/dashboard');
}
