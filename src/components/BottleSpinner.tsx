
import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Canvas, Path, Group, Skia, RadialGradient, vec, Blur } from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { BOTTLE_SVG_PATH } from '../constants/constant';

const { width } = Dimensions.get('window');
const SPINNER_SIZE = width * 0.8;
const CENTER = SPINNER_SIZE / 2;
const BOTTLE_SCALE = 10; 

interface BottleSpinnerProps {
    rotation: number;
    isSpinning: boolean;
    onSpinEnd: () => void;
}

export const BottleSpinner: React.FC<BottleSpinnerProps> = ({ rotation, isSpinning, onSpinEnd }) => {
    const rotationSv = useSharedValue(0);

    // Prepare Skia Path
    const bottlePath = useMemo(() => {
        const path = Skia.Path.MakeFromSVGString(BOTTLE_SVG_PATH);
        if (!path) return null;

        // Center and Scale the bottle
        // The SVG is roughly 24x24 centered at 12,12
        const matrix = Skia.Matrix();
        matrix.translate(CENTER - (12 * BOTTLE_SCALE), CENTER - (12 * BOTTLE_SCALE));
        matrix.scale(BOTTLE_SCALE, BOTTLE_SCALE);
        path.transform(matrix);
        return path;
    }, []);


    useEffect(() => {
        if (isSpinning) {
            rotationSv.value = withTiming(rotation, {
                duration: 3500,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }, (finished) => {
                if (finished && onSpinEnd) {
                    runOnJS(onSpinEnd)();
                }
            });
        }
    }, [isSpinning]);
    

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotationSv.value}deg` }]
    }));

    if (!bottlePath) return null;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.spinnerContainer, animatedStyle]}>
                <Canvas style={{ width: SPINNER_SIZE, height: SPINNER_SIZE }}>
                    <Group>
                        {/* Shadow Layer */}
                        <Path
                            path={bottlePath}
                            color="rgba(0,0,0,0.5)"
                            style="fill"
                        >
                            <Blur blur={8} />
                        </Path>

                        {/* Bottle Body with Gradient */}
                        <Path
                            path={bottlePath}
                            style="fill"
                        >
                            <RadialGradient
                                c={vec(CENTER, CENTER)}
                                r={SPINNER_SIZE / 3}
                                colors={["#34d399", "#059669", "#064e3b"]}
                            />
                        </Path>

                        {/* Bottle Outline */}
                        <Path
                            path={bottlePath}
                            color="#a7f3d0"
                            style="stroke"
                            strokeWidth={2}
                        />
                    </Group>
                </Canvas>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SPINNER_SIZE,
        height: SPINNER_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerContainer: {
        width: SPINNER_SIZE,
        height: SPINNER_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
