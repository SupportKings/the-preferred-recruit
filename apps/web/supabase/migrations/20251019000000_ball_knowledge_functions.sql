-- ============================================================================
-- FUNCTION: get_ball_knowledge_for_coach
-- Description: Fetches all ball knowledge records related to a coach:
--              - Direct coach records
--              - Related university records (from university_jobs)
--              - Related program records (from university_jobs)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_ball_knowledge_for_coach(
	p_coach_id UUID,
	p_page INT DEFAULT 1,
	p_page_size INT DEFAULT 10,
	p_sort_column TEXT DEFAULT 'created_at',
	p_sort_direction TEXT DEFAULT 'DESC',
	p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
	id UUID,
	note TEXT,
	source_type TEXT,
	review_after TIMESTAMPTZ,
	internal_notes TEXT,
	created_at TIMESTAMPTZ,
	updated_at TIMESTAMPTZ,
	from_athlete_id UUID,
	about_coach_id UUID,
	about_coach_name TEXT,
	about_university_id UUID,
	about_university_name TEXT,
	about_program_id UUID,
	about_program_gender TEXT,
	relation_type TEXT,
	total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
	v_offset INT;
	v_search_pattern TEXT;
BEGIN
	v_offset := (p_page - 1) * p_page_size;
	v_search_pattern := '%' || COALESCE(p_search, '') || '%';

	RETURN QUERY
	WITH related_ball_knowledge AS (
		-- Direct coach ball knowledge
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'direct_coach'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_coach_id = p_coach_id
			AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)

		UNION ALL

		-- Related university ball knowledge (from jobs)
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'related_university'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_university_id IN (
			SELECT DISTINCT uj.university_id
			FROM university_jobs uj
			WHERE uj.coach_id = p_coach_id
				AND (uj.is_deleted = FALSE OR uj.is_deleted IS NULL)
		)
		AND bk.about_coach_id IS NULL
		AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)

		UNION ALL

		-- Related program ball knowledge (from jobs)
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'related_program'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_program_id IN (
			SELECT DISTINCT uj.program_id
			FROM university_jobs uj
			WHERE uj.coach_id = p_coach_id
				AND (uj.is_deleted = FALSE OR uj.is_deleted IS NULL)
		)
		AND bk.about_coach_id IS NULL
		AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)
	),
	filtered_results AS (
		SELECT
			rbk.id,
			rbk.note,
			rbk.source_type,
			rbk.review_after,
			rbk.internal_notes,
			rbk.created_at,
			rbk.updated_at,
			rbk.from_athlete_id,
			rbk.about_coach_id,
			rbk.about_coach_name,
			rbk.about_university_id,
			rbk.about_university_name,
			rbk.about_program_id,
			rbk.about_program_gender,
			rbk.relation_type
		FROM related_ball_knowledge rbk
		WHERE p_search IS NULL
			OR rbk.note ILIKE v_search_pattern
			OR rbk.source_type ILIKE v_search_pattern
			OR rbk.internal_notes ILIKE v_search_pattern
			OR rbk.about_coach_name ILIKE v_search_pattern
			OR rbk.about_university_name ILIKE v_search_pattern
	),
	counted_results AS (
		SELECT
			fr.id,
			fr.note,
			fr.source_type,
			fr.review_after,
			fr.internal_notes,
			fr.created_at,
			fr.updated_at,
			fr.from_athlete_id,
			fr.about_coach_id,
			fr.about_coach_name,
			fr.about_university_id,
			fr.about_university_name,
			fr.about_program_id,
			fr.about_program_gender,
			fr.relation_type,
			COUNT(*) OVER() AS total_count
		FROM filtered_results fr
	)
	SELECT
		cr.id,
		cr.note,
		cr.source_type,
		cr.review_after,
		cr.internal_notes,
		cr.created_at,
		cr.updated_at,
		cr.from_athlete_id,
		cr.about_coach_id,
		cr.about_coach_name,
		cr.about_university_id,
		cr.about_university_name,
		cr.about_program_id,
		cr.about_program_gender,
		cr.relation_type,
		cr.total_count
	FROM counted_results cr
	ORDER BY
		CASE WHEN p_sort_direction = 'ASC' THEN
			CASE p_sort_column
				WHEN 'created_at' THEN cr.created_at::TEXT
				WHEN 'note' THEN cr.note
				WHEN 'source_type' THEN cr.source_type
				WHEN 'review_after' THEN cr.review_after::TEXT
				ELSE cr.created_at::TEXT
			END
		END ASC,
		CASE WHEN p_sort_direction = 'DESC' THEN
			CASE p_sort_column
				WHEN 'created_at' THEN cr.created_at::TEXT
				WHEN 'note' THEN cr.note
				WHEN 'source_type' THEN cr.source_type
				WHEN 'review_after' THEN cr.review_after::TEXT
				ELSE cr.created_at::TEXT
			END
		END DESC
	LIMIT p_page_size
	OFFSET v_offset;
END;
$$;

-- ============================================================================
-- FUNCTION: get_ball_knowledge_for_university
-- Description: Fetches all ball knowledge records related to a university:
--              - Direct university records
--              - Related coach records (from university_jobs)
--              - Related program records (programs belong to university)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_ball_knowledge_for_university(
	p_university_id UUID,
	p_page INT DEFAULT 1,
	p_page_size INT DEFAULT 10,
	p_sort_column TEXT DEFAULT 'created_at',
	p_sort_direction TEXT DEFAULT 'DESC',
	p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
	id UUID,
	note TEXT,
	source_type TEXT,
	review_after TIMESTAMPTZ,
	internal_notes TEXT,
	created_at TIMESTAMPTZ,
	updated_at TIMESTAMPTZ,
	from_athlete_id UUID,
	about_coach_id UUID,
	about_coach_name TEXT,
	about_university_id UUID,
	about_university_name TEXT,
	about_program_id UUID,
	about_program_gender TEXT,
	relation_type TEXT,
	total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
	v_offset INT;
	v_search_pattern TEXT;
BEGIN
	v_offset := (p_page - 1) * p_page_size;
	v_search_pattern := '%' || COALESCE(p_search, '') || '%';

	RETURN QUERY
	WITH related_ball_knowledge AS (
		-- Direct university ball knowledge
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'direct_university'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_university_id = p_university_id
			AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)

		UNION ALL

		-- Related coach ball knowledge (coaches employed at this university)
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'related_coach'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_coach_id IN (
			SELECT DISTINCT uj.coach_id
			FROM university_jobs uj
			WHERE uj.university_id = p_university_id
				AND (uj.is_deleted = FALSE OR uj.is_deleted IS NULL)
		)
		AND bk.about_university_id IS NULL
		AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)

		UNION ALL

		-- Related program ball knowledge (programs at this university)
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'related_program'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_program_id IN (
			SELECT DISTINCT prog.id
			FROM programs prog
			WHERE prog.university_id = p_university_id
				AND (prog.is_deleted = FALSE OR prog.is_deleted IS NULL)
		)
		AND bk.about_university_id IS NULL
		AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)
	),
	filtered_results AS (
		SELECT
			rbk.id,
			rbk.note,
			rbk.source_type,
			rbk.review_after,
			rbk.internal_notes,
			rbk.created_at,
			rbk.updated_at,
			rbk.from_athlete_id,
			rbk.about_coach_id,
			rbk.about_coach_name,
			rbk.about_university_id,
			rbk.about_university_name,
			rbk.about_program_id,
			rbk.about_program_gender,
			rbk.relation_type
		FROM related_ball_knowledge rbk
		WHERE p_search IS NULL
			OR rbk.note ILIKE v_search_pattern
			OR rbk.source_type ILIKE v_search_pattern
			OR rbk.internal_notes ILIKE v_search_pattern
			OR rbk.about_coach_name ILIKE v_search_pattern
			OR rbk.about_university_name ILIKE v_search_pattern
	),
	counted_results AS (
		SELECT
			fr.id,
			fr.note,
			fr.source_type,
			fr.review_after,
			fr.internal_notes,
			fr.created_at,
			fr.updated_at,
			fr.from_athlete_id,
			fr.about_coach_id,
			fr.about_coach_name,
			fr.about_university_id,
			fr.about_university_name,
			fr.about_program_id,
			fr.about_program_gender,
			fr.relation_type,
			COUNT(*) OVER() AS total_count
		FROM filtered_results fr
	)
	SELECT
		cr.id,
		cr.note,
		cr.source_type,
		cr.review_after,
		cr.internal_notes,
		cr.created_at,
		cr.updated_at,
		cr.from_athlete_id,
		cr.about_coach_id,
		cr.about_coach_name,
		cr.about_university_id,
		cr.about_university_name,
		cr.about_program_id,
		cr.about_program_gender,
		cr.relation_type,
		cr.total_count
	FROM counted_results cr
	ORDER BY
		CASE WHEN p_sort_direction = 'ASC' THEN
			CASE p_sort_column
				WHEN 'created_at' THEN cr.created_at::TEXT
				WHEN 'note' THEN cr.note
				WHEN 'source_type' THEN cr.source_type
				WHEN 'review_after' THEN cr.review_after::TEXT
				ELSE cr.created_at::TEXT
			END
		END ASC,
		CASE WHEN p_sort_direction = 'DESC' THEN
			CASE p_sort_column
				WHEN 'created_at' THEN cr.created_at::TEXT
				WHEN 'note' THEN cr.note
				WHEN 'source_type' THEN cr.source_type
				WHEN 'review_after' THEN cr.review_after::TEXT
				ELSE cr.created_at::TEXT
			END
		END DESC
	LIMIT p_page_size
	OFFSET v_offset;
END;
$$;

-- ============================================================================
-- FUNCTION: get_ball_knowledge_for_program
-- Description: Fetches all ball knowledge records related to a program:
--              - Direct program records
--              - Related university records (program belongs to university)
--              - Related coach records (from university_jobs for this program)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_ball_knowledge_for_program(
	p_program_id UUID,
	p_page INT DEFAULT 1,
	p_page_size INT DEFAULT 10,
	p_sort_column TEXT DEFAULT 'created_at',
	p_sort_direction TEXT DEFAULT 'DESC',
	p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
	id UUID,
	note TEXT,
	source_type TEXT,
	review_after TIMESTAMPTZ,
	internal_notes TEXT,
	created_at TIMESTAMPTZ,
	updated_at TIMESTAMPTZ,
	from_athlete_id UUID,
	about_coach_id UUID,
	about_coach_name TEXT,
	about_university_id UUID,
	about_university_name TEXT,
	about_program_id UUID,
	about_program_gender TEXT,
	relation_type TEXT,
	total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
	v_offset INT;
	v_search_pattern TEXT;
	v_university_id UUID;
BEGIN
	v_offset := (p_page - 1) * p_page_size;
	v_search_pattern := '%' || COALESCE(p_search, '') || '%';

	-- Get the university_id for this program
	SELECT prog.university_id INTO v_university_id
	FROM programs prog
	WHERE prog.id = p_program_id;

	RETURN QUERY
	WITH related_ball_knowledge AS (
		-- Direct program ball knowledge
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'direct_program'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_program_id = p_program_id
			AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)

		UNION ALL

		-- Related university ball knowledge (program's parent university)
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'related_university'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_university_id = v_university_id
			AND bk.about_program_id IS NULL
			AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)

		UNION ALL

		-- Related coach ball knowledge (coaches working for this program)
		SELECT
			bk.id,
			bk.note,
			bk.source_type,
			bk.review_after,
			bk.internal_notes,
			bk.created_at,
			bk.updated_at,
			bk.from_athlete_id,
			bk.about_coach_id,
			c.full_name AS about_coach_name,
			bk.about_university_id,
			u.name AS about_university_name,
			bk.about_program_id,
			p.gender::TEXT AS about_program_gender,
			'related_coach'::TEXT AS relation_type
		FROM ball_knowledge bk
		LEFT JOIN coaches c ON bk.about_coach_id = c.id
		LEFT JOIN universities u ON bk.about_university_id = u.id
		LEFT JOIN programs p ON bk.about_program_id = p.id
		WHERE bk.about_coach_id IN (
			SELECT DISTINCT uj.coach_id
			FROM university_jobs uj
			WHERE uj.program_id = p_program_id
				AND (uj.is_deleted = FALSE OR uj.is_deleted IS NULL)
		)
		AND bk.about_program_id IS NULL
		AND bk.about_university_id IS NULL
		AND (bk.is_deleted = FALSE OR bk.is_deleted IS NULL)
	),
	filtered_results AS (
		SELECT
			rbk.id,
			rbk.note,
			rbk.source_type,
			rbk.review_after,
			rbk.internal_notes,
			rbk.created_at,
			rbk.updated_at,
			rbk.from_athlete_id,
			rbk.about_coach_id,
			rbk.about_coach_name,
			rbk.about_university_id,
			rbk.about_university_name,
			rbk.about_program_id,
			rbk.about_program_gender,
			rbk.relation_type
		FROM related_ball_knowledge rbk
		WHERE p_search IS NULL
			OR rbk.note ILIKE v_search_pattern
			OR rbk.source_type ILIKE v_search_pattern
			OR rbk.internal_notes ILIKE v_search_pattern
			OR rbk.about_coach_name ILIKE v_search_pattern
			OR rbk.about_university_name ILIKE v_search_pattern
	),
	counted_results AS (
		SELECT
			fr.id,
			fr.note,
			fr.source_type,
			fr.review_after,
			fr.internal_notes,
			fr.created_at,
			fr.updated_at,
			fr.from_athlete_id,
			fr.about_coach_id,
			fr.about_coach_name,
			fr.about_university_id,
			fr.about_university_name,
			fr.about_program_id,
			fr.about_program_gender,
			fr.relation_type,
			COUNT(*) OVER() AS total_count
		FROM filtered_results fr
	)
	SELECT
		cr.id,
		cr.note,
		cr.source_type,
		cr.review_after,
		cr.internal_notes,
		cr.created_at,
		cr.updated_at,
		cr.from_athlete_id,
		cr.about_coach_id,
		cr.about_coach_name,
		cr.about_university_id,
		cr.about_university_name,
		cr.about_program_id,
		cr.about_program_gender,
		cr.relation_type,
		cr.total_count
	FROM counted_results cr
	ORDER BY
		CASE WHEN p_sort_direction = 'ASC' THEN
			CASE p_sort_column
				WHEN 'created_at' THEN cr.created_at::TEXT
				WHEN 'note' THEN cr.note
				WHEN 'source_type' THEN cr.source_type
				WHEN 'review_after' THEN cr.review_after::TEXT
				ELSE cr.created_at::TEXT
			END
		END ASC,
		CASE WHEN p_sort_direction = 'DESC' THEN
			CASE p_sort_column
				WHEN 'created_at' THEN cr.created_at::TEXT
				WHEN 'note' THEN cr.note
				WHEN 'source_type' THEN cr.source_type
				WHEN 'review_after' THEN cr.review_after::TEXT
				ELSE cr.created_at::TEXT
			END
		END DESC
	LIMIT p_page_size
	OFFSET v_offset;
END;
$$;
