export type AnimationState = 'idle' | 'walk' | 'run' | 'sit'

export function useAvatarAnimation(state: AnimationState, _speed: number) {
  const getAnimValues = (elapsed: number) => {
    const t = elapsed * (state === 'run' ? 2.5 : state === 'walk' ? 1.5 : 0.8)

    if (state === 'idle') {
      return {
        bodyY: Math.sin(t * 0.5) * 0.02,
        leftArmRotX: Math.sin(t * 0.5) * 0.05,
        rightArmRotX: -Math.sin(t * 0.5) * 0.05,
        leftLegRotX: 0,
        rightLegRotX: 0,
        leftElbowBend: 0.1,
        rightElbowBend: 0.1,
        leftKneeBend: 0,
        rightKneeBend: 0,
        headBob: Math.sin(t * 0.5) * 0.01,
      }
    }

    if (state === 'walk' || state === 'run') {
      const swing = state === 'run' ? 0.6 : 0.35
      const kneeBend = state === 'run' ? 0.8 : 0.4
      return {
        bodyY: Math.abs(Math.sin(t * 2)) * 0.03,
        leftArmRotX: Math.sin(t * 2) * swing,
        rightArmRotX: -Math.sin(t * 2) * swing,
        leftLegRotX: -Math.sin(t * 2) * swing,
        rightLegRotX: Math.sin(t * 2) * swing,
        leftElbowBend: Math.abs(Math.sin(t * 2)) * kneeBend * 0.8 + 0.2,
        rightElbowBend: Math.abs(Math.sin(t * 2 + Math.PI)) * kneeBend * 0.8 + 0.2,
        leftKneeBend: Math.max(0, Math.sin(t * 2)) * kneeBend,
        rightKneeBend: Math.max(0, Math.sin(t * 2 + Math.PI)) * kneeBend,
        headBob: Math.abs(Math.sin(t * 2)) * 0.02,
      }
    }

    if (state === 'sit') {
      return {
        bodyY: 0,
        leftArmRotX: -0.3,
        rightArmRotX: -0.3,
        leftLegRotX: 1.5,
        rightLegRotX: 1.5,
        leftElbowBend: 0.3,
        rightElbowBend: 0.3,
        leftKneeBend: 1.5,
        rightKneeBend: 1.5,
        headBob: 0,
      }
    }

    return {
      bodyY: 0, leftArmRotX: 0, rightArmRotX: 0,
      leftLegRotX: 0, rightLegRotX: 0,
      leftElbowBend: 0, rightElbowBend: 0,
      leftKneeBend: 0, rightKneeBend: 0,
      headBob: 0,
    }
  }

  return { getAnimValues }
}

export default function AnimationManager() {
  return null
}
