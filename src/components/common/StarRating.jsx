import { IoMdStar, IoMdStarHalf, IoMdStarOutline } from 'react-icons/io';

const StarRating = ({ rating = 0, size = 16, interactive = false, onRate = null }) => {
  const stars = [];

  const handleClick = (value) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <IoMdStar
          key={i}
          size={size}
          style={{
            color: 'var(--color-warning)',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'transform 0.2s ease'
          }}
          onClick={() => handleClick(i)}
          onMouseEnter={(e) => interactive && (e.target.style.transform = 'scale(1.2)')}
          onMouseLeave={(e) => interactive && (e.target.style.transform = 'scale(1)')}
        />
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <IoMdStarHalf
          key={i}
          size={size}
          style={{
            color: 'var(--color-warning)',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'transform 0.2s ease'
          }}
          onClick={() => handleClick(i)}
        />
      );
    } else {
      stars.push(
        <IoMdStarOutline
          key={i}
          size={size}
          style={{
            color: 'var(--color-warning)',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'transform 0.2s ease'
          }}
          onClick={() => handleClick(i)}
          onMouseEnter={(e) => interactive && (e.target.style.transform = 'scale(1.2)')}
          onMouseLeave={(e) => interactive && (e.target.style.transform = 'scale(1)')}
        />
      );
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars}
    </div>
  );
};

export default StarRating;
