@@ .. @@
 -- Function to automatically create a profile when a user signs up
 CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger AS $$
 BEGIN
   INSERT INTO public.profiles (id, username, full_name, avatar_url)
+  INSERT INTO public.profiles (id, username, full_name, avatar_url, account_type)
   VALUES (
     new.id,
     new.raw_user_meta_data->>'username',
     new.raw_user_meta_data->>'full_name',
-    new.raw_user_meta_data->>'avatar_url'
+    new.raw_user_meta_data->>'avatar_url',
+    COALESCE(new.raw_user_meta_data->>'account_type', 'person')
   );
   RETURN new;
 END;
@@ .. @@