
-- Review acquisition system: track review requests sent after order completion
CREATE TABLE public.review_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  city_name TEXT,
  market_code TEXT,
  review_link TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms',
  sent_at TIMESTAMPTZ,
  sms_sent_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  review_received BOOLEAN DEFAULT false,
  review_received_at TIMESTAMPTZ,
  review_rating INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage review requests"
ON public.review_requests
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_review_requests_order ON public.review_requests(order_id);
CREATE INDEX idx_review_requests_status ON public.review_requests(status);
CREATE UNIQUE INDEX idx_review_requests_unique_order ON public.review_requests(order_id) WHERE status != 'failed';

CREATE TRIGGER update_review_requests_updated_at
BEFORE UPDATE ON public.review_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
