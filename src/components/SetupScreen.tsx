
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Users, Plus, Trash2, Play } from 'lucide-react-native';
import { COLORS } from '../constants/constant';
import { Player } from '../types/types';

interface SetupScreenProps {
    onStartGame: (players: Player[]) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
    const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);

    const handleAddPlayer = () => {
        if (playerNames.length >= 12) {
            Alert.alert("Limit Reached", "Max 12 players allowed.");
            return;
        }
        setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
    };

    const handleRemovePlayer = (index: number) => {
        if (playerNames.length <= 2) {
            Alert.alert("Minimum Players", "Minimum 2 players required.");
            return;
        }
        const newNames = playerNames.filter((_, i) => i !== index);
        setPlayerNames(newNames);
    };

    const handleNameChange = (index: number, value: string) => {
        const newNames = [...playerNames];
        newNames[index] = value;
        setPlayerNames(newNames);
    };

    const handleStart = () => {
        if (playerNames.some(name => !name.trim())) {
            Alert.alert("Invalid Names", "All players must have a name.");
            return;
        }

        const players: Player[] = playerNames.map((name, index) => ({
            id: `p-${index}-${Date.now()}`,
            name: name.trim(),
            color: COLORS[index % COLORS.length],
        }));

        onStartGame(players);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Users color="#fff" size={32} />
                </View>
                <Text style={styles.title}>Truth or Dare</Text>
                <Text style={styles.subtitle}>Setup your players</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Players ({playerNames.length})</Text>
                    <TouchableOpacity onPress={handleAddPlayer} style={styles.addButton}>
                        <Plus color="#a855f7" size={24} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                    {playerNames.map((name, index) => (
                        <View key={index} style={styles.inputRow}>
                            <View style={[styles.colorIndicator, { backgroundColor: COLORS[index % COLORS.length] }]} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={(text) => handleNameChange(index, text)}
                                placeholder={`Player ${index + 1}`}
                                placeholderTextColor="#64748b"
                            />
                            <TouchableOpacity
                                onPress={() => handleRemovePlayer(index)}
                                style={styles.deleteButton}
                            >
                                <Trash2 color="#ef4444" size={20} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity onPress={handleStart} style={styles.startButton}>
                    <Play fill="currentColor" color="#fff" size={20} />
                    <Text style={styles.startButtonText}>Start Game</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.5)',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 16,
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
        maxHeight: '60%',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        color: '#e2e8f0',
        fontSize: 18,
        fontWeight: '600',
    },
    addButton: {
        padding: 8,
        backgroundColor: '#334155',
        borderRadius: 8,
    },
    list: {
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    colorIndicator: {
        width: 12,
        height: 44,
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        height: 44,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        color: '#fff',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    deleteButton: {
        padding: 10,
        marginLeft: 8,
    },
    startButton: {
        backgroundColor: '#9333ea',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
        gap: 8,
    },
    startButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
