-- Add locked_tokens column to keepers_coins
ALTER TABLE keepers_coins ADD COLUMN IF NOT EXISTS locked_tokens INTEGER NOT NULL DEFAULT 0;

-- RPC: lock tokens when a bid is placed
CREATE OR REPLACE FUNCTION lock_tokens(p_user_id UUID, p_amount INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE keepers_coins
  SET balance = balance - p_amount,
      locked_tokens = locked_tokens + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id AND balance >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance to lock % tokens', p_amount;
  END IF;
END;
$$;

-- RPC: release locked tokens when outbid
CREATE OR REPLACE FUNCTION release_locked_tokens(p_user_id UUID, p_amount INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE keepers_coins
  SET balance = balance + p_amount,
      locked_tokens = locked_tokens - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id AND locked_tokens >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot release % locked tokens: insufficient locked balance', p_amount;
  END IF;
END;
$$;

-- RPC: settle auction bid (deduct from winner's locked, credit seller)
CREATE OR REPLACE FUNCTION settle_bid(
  p_winner_id UUID,
  p_seller_id UUID,
  p_amount INTEGER,
  p_auction_id UUID
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Deduct from winner locked tokens
  UPDATE keepers_coins
  SET locked_tokens = locked_tokens - p_amount,
      updated_at = NOW()
  WHERE user_id = p_winner_id AND locked_tokens >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Winner does not have % locked tokens', p_amount;
  END IF;

  -- Credit seller
  UPDATE keepers_coins
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_seller_id;

  -- Log transactions
  INSERT INTO coin_transactions (user_id, type, amount, description, reference_id)
  VALUES
    (p_winner_id, 'spend', -p_amount, 'Auction win payment', p_auction_id::TEXT),
    (p_seller_id, 'earn', p_amount, 'Auction sale proceeds', p_auction_id::TEXT);
END;
$$;
