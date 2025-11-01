const PlayerCard = ({ player, rank }) => {
  return (
    <div className="player-card">
      <span className="rank">#{rank}</span>
      <span className="name">{player.name}</span>
      <span className="score">{player.score}</span>
    </div>
  );
};

export default PlayerCard;
