
import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { Player } from "./src/types/types";
import { SetupScreen } from './src/components/SetupScreen';
import { GameScreen } from './src/components/GameScreen';


// Root Component
const App = () => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const handleStartGame = (configuredPlayers: Player[]) => {
    setPlayers(configuredPlayers);
    setGameStarted(true);
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
    setPlayers([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar barStyle="light-content" />
      {!gameStarted ? (
        <SetupScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen players={players} onBack={handleBackToSetup} />
      )}
    </View>
  );
};

export default App;
