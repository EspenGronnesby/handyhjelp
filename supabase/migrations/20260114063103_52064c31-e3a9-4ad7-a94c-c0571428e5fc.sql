-- Legg til platform_owner-rolle for eksisterende admin-brukere
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'platform_owner'::app_role
FROM user_roles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;