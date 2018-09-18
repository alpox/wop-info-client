import React, { Component } from 'react';
import logo from './wop.jpg';
import './App.css';

const Colored = ({ value }) => {
    const colors = [
        'black',
        'red',
        'green',
        'yellow',
        'blue',
        'cyan',
        'magenta',
        'white'
    ];
    const colored = [];

    let i = 0;

    while (i < value.length) {
        let next = value.indexOf('^', i + 1);

        if (next === -1) next = value.length;

        if (value[i] !== '^') {
            colored.push(value.slice(0, next));
            i = next;
            continue;
        }

        const colorCode = parseInt(value[i + 1], 10);
        const text = value
            .slice(i + 2, next)
            .replace('\xa0', ' ')
            .replace(String.fromCharCode(127), '')
            .trim();

        if (text)
            colored.push(
                <span key={colored.length} className={colors[colorCode]}>
                    {text}
                </span>
            );

        i = next;
    }

    return colored;
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            serverInfo: []
        };

        this.gametypes = [
            'Free For All',
            'Tournament',
            'Single Player',
            'Team Deathmatch',
            'Last Pad Standing',
            'Spray your Color',
            'Capture the Lolly'
        ];
    }

    withoutColor(hostname) {
        return hostname.replace(/\^\d/g, '');
    }

    sortInfo(info) {
        return info.sort((a, b) => {
            const hostname1 = this.withoutColor(a.hostname);
            const hostname2 = this.withoutColor(b.hostname);
            return hostname1.localeCompare(hostname2);
        });
    }

    componentDidMount() {
        const socket = window.io(process.env.REACT_APP_SERVER);
        socket.on('updated', data => {
            this.setState(state => ({
                serverInfo: this.sortInfo(data)
            }));
        });
    }

    getPlayers(server) {
        if (!server.g_beryllium) return [];
        const infoStr = server.g_beryllium.split('\n').slice(1, -1);

        return infoStr.map(playerString => {
            const player = /([-\d]+) ([-\d]+) "(.+?)"/.exec(playerString);

            return {
                name: player[3].trim(),
                frags: player[1],
                ping: player[2]
            };
        });
    }

    render() {
        return (
            <div className="app">
                <header className="header">
                    <img src={logo} className="logo" alt="logo" />
                    <h1 className="app-title">
                        World of Padman - Server Status
                    </h1>
                </header>
                <div className="container">
                    {this.state.serverInfo.map(server => (
                        <div className="row" key={server.hostname}>
                            <div className="server-title">
                                <h1>
                                    <Colored value={server.hostname} />
                                </h1>
                            </div>
                            <div className="server-info">
                                <div className="info">
                                    <span className="key">Current Map:</span>
                                    <span className="value">
                                        {server.mapname}
                                    </span>
                                </div>
                                <div className="info">
                                    <span className="key">Game type:</span>
                                    <span className="value">
                                        {this.gametypes[server.gametype]}
                                    </span>
                                </div>
                                <div className="info">
                                    <span className="key">Point limit:</span>
                                    <span className="value">
                                        {server.pointlimit}
                                    </span>
                                </div>
                                <div className="info">
                                    <span className="key">Time limit:</span>
                                    <span className="value">
                                        {server.timelimit}
                                    </span>
                                </div>
                            </div>
                            <div className="players-info">
                                <div className="info title">
                                    <div className="name">Player</div>
                                    <div className="frags">Frags</div>
                                    <div className="ping">Ping</div>
                                </div>
                                {this.getPlayers(server).map((player, idx) => (
                                    <div className="info" key={idx}>
                                        <div className="name">
                                            <Colored value={player.name} />
                                        </div>
                                        <div className="frags">
                                            {player.frags}
                                        </div>
                                        <div className="ping">
                                            {player.ping}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default App;
