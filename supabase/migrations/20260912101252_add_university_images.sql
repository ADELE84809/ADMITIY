-- Assign campus photos to all universities missing image_url, cycling through a pool of images
WITH image_pool AS (
  SELECT * FROM (VALUES
    (0, 'https://images.pexels.com/photos/19554793/pexels-photo-19554793.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (1, 'https://images.pexels.com/photos/37877709/pexels-photo-37877709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (2, 'https://images.pexels.com/photos/396304/pexels-photo-396304.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (3, 'https://images.pexels.com/photos/7710853/pexels-photo-7710853.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (4, 'https://images.pexels.com/photos/5147366/pexels-photo-5147366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (5, 'https://images.pexels.com/photos/8811595/pexels-photo-8811595.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (6, 'https://images.pexels.com/photos/17792668/pexels-photo-17792668.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (7, 'https://images.pexels.com/photos/31156623/pexels-photo-31156623.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (8, 'https://images.pexels.com/photos/8197553/pexels-photo-8197553.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (9, 'https://images.pexels.com/photos/8197508/pexels-photo-8197508.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (10, 'https://images.pexels.com/photos/6333725/pexels-photo-6333725.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (11, 'https://images.pexels.com/photos/28463480/pexels-photo-28463480.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (12, 'https://images.pexels.com/photos/9572477/pexels-photo-9572477.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (13, 'https://images.pexels.com/photos/13933247/pexels-photo-13933247.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    (14, 'https://images.pexels.com/photos/8199160/pexels-photo-8199160.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
  ) AS t(idx, url)
),
ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY ranking, name) - 1 AS rn
  FROM universities
  WHERE image_url IS NULL
)
UPDATE universities u
SET image_url = ip.url
FROM ranked r
JOIN image_pool ip ON ip.idx = (r.rn % 15)
WHERE u.id = r.id;
