-- Create a function to delete all assistants for the current user
CREATE OR REPLACE FUNCTION delete_all_user_assistants()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all assistant knowledge associations first
  DELETE FROM assistant_knowledge 
  WHERE assistant_id IN (
    SELECT id FROM assistants WHERE user_id = auth.uid()
  );
  
  -- Delete all conversations and their messages
  DELETE FROM messages 
  WHERE conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  );
  
  DELETE FROM conversations 
  WHERE user_id = auth.uid();
  
  -- Delete all assistants for the current user
  DELETE FROM assistants 
  WHERE user_id = auth.uid();
END;
$$;