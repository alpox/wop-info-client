import React, { Component } from 'react';
import logo from './wop.jpg';

const VERSION_16 = '1.6';
const VERSION_12 = '1.2';

const Colored = ({ value }) => {
    const colors = [
        'white',
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
            .replace(String.fromCharCode(127), '');

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
            serverInfo16: [],
            serverInfo12: [],
            version: VERSION_16
        };

        this.gametypes = [
            'Free For All',
            'Tournament',
            'Single Player',
            'Spray your Color',
            'Last Pad Standing',
            'Team Deathmatch',
            'Capture the Lolly',
            'Team Spray your Color',
            'Big Balloon'
        ];

        this.toggleVersion = this.toggleVersion.bind(this);
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
            const sortedInfo = this.sortInfo(data).map(info => ({
                ...info,
                players: this.getPlayers(info)
            }));

            this.setState(_ => ({
                serverInfo16: sortedInfo.filter(info => info.version === VERSION_16),
                serverInfo12: sortedInfo.filter(info => info.version === VERSION_12)
            }));
        });
    }
    

    getPlayers(server) {
        let playersString = server['.Web2'] || server.g_beryllium || server.g_Modifier_WeaponScore
        if(!playersString) {
            playersString = server.Players_Bot.concat(
                server.Players_Team && server.Players_Team.split('\n').slice(1).join('\n')
            );
        }

        if (!playersString) return [];

        const infoStr = playersString.split('\n').slice(1, -1);

        return infoStr
            .map(playerString => {
                const player = /([-\d]+) ([-\d]+) "(.+?)"/.exec(playerString);

                return {
                    name: player[3].trim(),
                    frags: player[1],
                    ping: player[2]
                };
            })
            .sort((a, b) => b.frags - a.frags);
    }

    versionClass(version) {
        return this.state.version === version ? 'active' : '';
    }

    toggleVersion() {
        this.setState(state => ({
            version: state.version === VERSION_16 ? VERSION_12 : VERSION_16
        }));
    }

    render() {
        const serverInfo = this.state.version === VERSION_16
            ? this.state.serverInfo16
            : this.state.serverInfo12;

        return (
            <div className="app">
                <header className="header">
                    <img src={logo} className="logo" alt="logo" />
                    <div class="header-center">
                        <div class="switch" onClick={this.toggleVersion}>
                            <div className={this.versionClass('1.6')}>
                                <span>1.6</span>
                            </div>
                            <div className={this.versionClass('1.2')}>
                                <span>1.2</span>
                            </div>
                        </div>
                    </div>
                    <h1 className="app-title">
                        World of Padman - Server Status
                    </h1>
                </header>
                <div className="container">
                    {serverInfo.map(server => (
                        <div className="row" key={server.hostname}>
                            <div className="server-title">
                                <h1>
                                    <Colored value={server.hostname} />
                                </h1>
                            </div>
                            <div className="server-info">
                                <div className="info">
                                    <div className="key">Current Map:</div>
                                    <div className="value">
                                        {server.mapname}
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="key">Game type:</div>
                                    <div className="value">
                                        {this.gametypes[server.gametype]}
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="key">Point limit:</div>
                                    <div className="value">
                                        {server.pointlimit}
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="key">Time limit:</div>
                                    <div className="value">
                                        {server.timelimit}
                                    </div>
                                </div>
                            </div>
                            <div className="players-info">
                                <div className="info title">
                                    <div className="name">Player</div>
                                    <div className="frags">Score</div>
                                    <div className="ping">Ping</div>
                                </div>
                                {!server.players.length 
                                    ? <div className="info no-players">No players online</div>
                                    : server.players.map((player, idx) => (
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
