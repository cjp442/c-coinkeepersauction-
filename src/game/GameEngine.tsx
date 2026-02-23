// GameEngine.tsx

import React from 'react';

// Define interfaces for scenes
interface Scene {
    render: () => JSX.Element;
}

class LobbyScene implements Scene {
    render() {
        return <div>Lobby Scene</div>;
    }
}

class HostRoomScene implements Scene {
    render() {
        return <div>Host Room Scene</div>;
    }
}

class MemberRoomScene implements Scene {
    render() {
        return <div>Member Room Scene</div>;
    }
}

// Main Game Engine Component
const GameEngine: React.FC = () => {
    const [currentScene, setCurrentScene] = React.useState<Scene>(new LobbyScene());

    const switchToLobby = () => setCurrentScene(new LobbyScene());
    const switchToHostRoom = () => setCurrentScene(new HostRoomScene());
    const switchToMemberRoom = () => setCurrentScene(new MemberRoomScene());

    return (
        <div>
            <div>
                <button onClick={switchToLobby}>Lobby</button>
                <button onClick={switchToHostRoom}>Host Room</button>
                <button onClick={switchToMemberRoom}>Member Room</button>
            </div>
            <div>
                {currentScene.render()}
            </div>
        </div>
    );
};

export default GameEngine;
