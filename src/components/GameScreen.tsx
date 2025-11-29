
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { ArrowLeft, MessageCircle, Zap, RefreshCw, Wand2 } from 'lucide-react-native';
import { BottleSpinner } from './BottleSpinner';
import { GamePhase, ChallengeType, Player, Challenge } from '../types/types';
import { STATIC_TRUTHS, STATIC_DARES } from '../constants/constant';
import { generateChallenge } from '../ai/aiservice';

const { width } = Dimensions.get('window');
const RADIUS = width * 0.35; // Radius for player avatars circle

interface GameScreenProps {
    players: Player[];
    onBack: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ players, onBack }) => {
    const [phase, setPhase] = useState<GamePhase>(GamePhase.READY);
    const [rotation, setRotation] = useState<number>(0);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
    const [loadingAi, setLoadingAi] = useState<boolean>(false);
    const [aiError, setAiError] = useState<boolean>(false);
    const [customTopic, setCustomTopic] = useState<string>('');


    // const spinBottle = () => {
    //     if (phase !== GamePhase.READY) return;

    //     setPhase(GamePhase.SPINNING);
    //     setSelectedPlayer(null);
    //     setCurrentChallenge(null);
    //     setAiError(false);

    //     // Physics Logic: Add random spins (5 to 10 full rotations)
    //     const minSpins = 5;
    //     const extraSpins = Math.random() * 5;
    //     const newRotation = rotation + (360 * minSpins) + (extraSpins * 360);
    //     setRotation(newRotation);
    // };

    const spinBottle = () => {
        if (phase !== GamePhase.READY) return;

        setPhase(GamePhase.SPINNING);
        setSelectedPlayer(null);
        setCurrentChallenge(null);
        setAiError(false);

        // 1. Pick a random winner index
        const winningIndex = Math.floor(Math.random() * players.length);

        // 2. Calculate the target angle for this player
        // Player 0 is at 0 degrees (Up), Player 1 is at (360/players) degrees, etc.
        const segmentSize = 360 / players.length;
        const targetBaseAngle = winningIndex * segmentSize;

        // 3. Add a small "jitter" so it doesn't look robotic (±15% of segment)
        // This keeps it pointing clearly at the player but not always dead center
        const jitter = 0//(Math.random() - 0.5) * (segmentSize * 0.3);
        const finalTargetAngle = targetBaseAngle + jitter;

        // 4. Calculate total rotation needed
        // We want to do at least 5 full spins
        const minFullSpins = 5;
        const extraSpins = Math.floor(Math.random() * 3); // 0 to 2 extra spins
        const totalDegreesToAdd = (minFullSpins + extraSpins) * 360;

        // 5. Calculate the new absolute rotation value
        // Find how much we need to add to current rotation to reach target (mod 360)
        const currentAngleMod = rotation % 360;
        let angleDiff = finalTargetAngle - currentAngleMod;

        // Ensure we always spin forward (positive difference)
        if (angleDiff < 0) {
            angleDiff += 360;
        }

        const newRotation = rotation + totalDegreesToAdd + angleDiff;
        setRotation(newRotation);
    };

    const handleSpinEnd = () => {
        const normalizedAngle = rotation % 360;
        const segmentSize = 360 / players.length;
        // Calculate index based on angle. Bottle points UP at 0.
        // Clockwise rotation matches player index increase clockwise from top.
        let index = Math.round(normalizedAngle / segmentSize) % players.length;
        if (index < 0) index += players.length;

        setSelectedPlayer(players[index]);
        setPhase(GamePhase.CHALLENGE_SELECTION);
    };

    const selectChallengeType = async (type: ChallengeType) => {
        setLoadingAi(true);
        setAiError(false); // reset previous error
        setPhase(GamePhase.CHALLENGE_ACTIVE); // safer phase before requesting AI

        try {
            const topic = customTopic?.trim() || ""; // safe trim
            const text = await generateChallenge(type, players.length, topic);

            if (!text || typeof text !== "string") {
                throw new Error("AI returned empty challenge text");
            }

            // Only set active challenge when successful
            setCurrentChallenge({
                type,
                text,
                isAiGenerated: true
            });

            setPhase(GamePhase.CHALLENGE_ACTIVE);

        } catch (error) {
            // console.error("AI Challenge Error:", error);

            // fallback: use static lists safely
            const bank = type === ChallengeType.TRUTH ? STATIC_TRUTHS : STATIC_DARES;

            const fallbackText =
                bank.length > 0
                    ? bank[Math.floor(Math.random() * bank.length)]
                    : "Please ask another challenge!";

            setCurrentChallenge({
                type,
                text: fallbackText,
                isAiGenerated: false
            });

            setAiError(true);
            setPhase(GamePhase.CHALLENGE_ACTIVE); // still show challenge instead of breaking the UI

        } finally {
            setLoadingAi(false);
        }
    };


    const nextRound = () => {
        setPhase(GamePhase.READY);
        setSelectedPlayer(null);
        setCurrentChallenge(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.playerCount}>{players.length} Players</Text>
            </View>


            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.gameArea}
            >
                <View style={styles.spinnerArea}>
                    {/* Players Circle */}
                    {players.map((player, index) => {
                        const angleDeg = (index * 360) / players.length;
                        const angleRad = (angleDeg - 90) * (Math.PI / 180);
                        const x = Math.cos(angleRad) * RADIUS;
                        const y = Math.sin(angleRad) * RADIUS;

                        const isSelected = selectedPlayer?.id === player.id;

                        return (
                            <View
                                key={player.id}
                                style={[
                                    styles.playerNode,
                                    { transform: [{ translateX: x }, { translateY: y }] },
                                    isSelected && styles.selectedNode
                                ]}
                            >
                                <View style={[styles.avatar, { backgroundColor: player.color, borderColor: isSelected ? '#fff' : 'transparent' }]}>
                                    <Text style={styles.avatarText}>{player.name[0].toUpperCase()}</Text>
                                </View>
                                <Text style={[styles.playerName, isSelected && { color: '#fff', fontWeight: 'bold' }]}>
                                    {player.name}
                                </Text>
                            </View>
                        );
                    })}

                    {/* The Spinner */}
                    <BottleSpinner
                        rotation={rotation}
                        isSpinning={phase === GamePhase.SPINNING}
                        onSpinEnd={handleSpinEnd}
                    />
                </View>
            </KeyboardAvoidingView>

            {/* Controls Overlay */}
            <View style={styles.controls}>
                {phase === GamePhase.READY && (
                    <TouchableOpacity onPress={spinBottle} style={styles.spinButton}>
                        <Text style={styles.spinButtonText}>SPIN BOTTLE</Text>
                    </TouchableOpacity>
                )}

                {/* Modal: Challenge Selection */}
                {phase === GamePhase.CHALLENGE_SELECTION && selectedPlayer && (
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>
                            <Text style={{ color: selectedPlayer.color }}>{selectedPlayer.name}</Text>'s Turn!
                        </Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Custom Topic (Optional)</Text>
                            <TextInput
                                style={styles.topicInput}
                                placeholder="e.g. school, love, food..."
                                placeholderTextColor="#64748b"
                                value={customTopic}
                                onChangeText={setCustomTopic}
                                maxLength={80}
                                returnKeyType="done"
                            />
                        </View>
                        <View style={styles.choiceRow}>
                            <TouchableOpacity
                                style={[styles.choiceBtn, { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}
                                onPress={() => selectChallengeType(ChallengeType.TRUTH)}
                            >
                                <MessageCircle color="#60a5fa" size={32} />
                                <Text style={styles.choiceText}>TRUTH</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.choiceBtn, { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
                                onPress={() => selectChallengeType(ChallengeType.DARE)}
                            >
                                <Zap color="#f87171" size={32} />
                                <Text style={styles.choiceText}>DARE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Modal: Active Challenge */}
                {phase === GamePhase.CHALLENGE_ACTIVE && (
                    <View style={styles.modal}>
                        {loadingAi ? (
                            <View style={{ alignItems: 'center', padding: 20 }}>
                                <ActivityIndicator size="large" color="#a855f7" />
                                <Text style={{ color: '#d8b4fe', marginTop: 10 }}>Conjuring fate...</Text>
                            </View>
                        ) : currentChallenge != null && (
                            <>
                                <View style={[styles.typeBadge, currentChallenge.type === ChallengeType.TRUTH ? styles.badgeTruth : styles.badgeDare]}>
                                    <Text style={styles.badgeText}>{currentChallenge.type}</Text>
                                </View>

                                <Text style={styles.challengeText}>{currentChallenge.text}</Text>

                                {currentChallenge.isAiGenerated && (
                                    <View style={styles.aiTag}>
                                        <Wand2 size={12} color="#c084fc" />
                                        <Text style={{ color: '#c084fc', fontSize: 12 }}>
                                            {customTopic ? `AI Generated: ${customTopic}` : 'AI Generated'}
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity onPress={nextRound} style={styles.nextBtn}>
                                    <RefreshCw color="#fff" size={20} />
                                    <Text style={styles.nextBtnText}>Next Round</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { padding: 16, flexDirection: 'row', alignItems: 'center', zIndex: 50 },
    backBtn: { padding: 8, backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: 20 },
    playerCount: { color: '#94a3b8', marginLeft: 16, fontSize: 16 },
    gameArea: { flex: 1 },
    spinnerArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    playerNode: { position: 'absolute', alignItems: 'center', width: 80, height: 80, justifyContent: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
    selectedNode: { zIndex: 10, transform: [{ scale: 1.2 }] },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    playerName: { color: '#64748b', fontSize: 12, marginTop: 4, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden' },
    controls: { position: 'absolute', bottom: 40, left: 20, right: 20, alignItems: 'center' },
    spinButton: { backgroundColor: '#10b981', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 16, shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
    spinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
    modal: { backgroundColor: 'rgba(30, 41, 59, 0.95)', padding: 24, borderRadius: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#475569' },
    modalTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    choiceRow: { flexDirection: 'row', gap: 16 },
    choiceBtn: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 2, alignItems: 'center', minWidth: 120 },
    choiceText: { color: '#fff', marginTop: 8, fontWeight: 'bold' },
    typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
    badgeTruth: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6' },
    badgeDare: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' },
    badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    challengeText: { color: '#f1f5f9', fontSize: 20, textAlign: 'center', marginBottom: 20, lineHeight: 28 },
    aiTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
    nextBtn: { backgroundColor: '#334155', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
    nextBtnText: { color: '#fff', fontWeight: '600' },
    inputContainer: { width: '100%', marginBottom: 20 },
    inputLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 6, marginLeft: 4 },
    topicInput: { backgroundColor: 'rgba(15, 23, 42, 0.5)', borderWidth: 1, borderColor: '#475569', borderRadius: 12, padding: 12, color: '#fff', fontSize: 16 }
});
