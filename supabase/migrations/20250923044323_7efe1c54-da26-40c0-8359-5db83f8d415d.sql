-- إنشاء حسابات اختبار للمطور
-- إدراج حساب المدير
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "مدير الاختبار", "role": "admin"}'::jsonb,
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- إدراج حساب العامل
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'worker@test.com',
  crypt('worker123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "عامل الاختبار", "role": "worker"}'::jsonb,
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- إنشاء ملفات التعريف للحسابات
INSERT INTO public.profiles (user_id, full_name, role)
SELECT u.id, u.raw_user_meta_data->>'full_name', (u.raw_user_meta_data->>'role')::text
FROM auth.users u
WHERE u.email IN ('admin@test.com', 'worker@test.com')
ON CONFLICT (user_id) DO NOTHING;