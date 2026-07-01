-- 009_message_status.sql

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen'));

-- Allow users to UPDATE the status of messages they RECEIVE (to mark as seen/delivered)
-- The existing policy only allows sender to insert, and both to select.
-- We need an UPDATE policy.

CREATE POLICY "Users can update status of received messages"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);
