/* @flow */
function getShuffledValues(side) {
	const length = side * side
	let values = new Array(length);
	for(let i = 0, j = 1; i < length; i++, j += 0.5) {
		let r = Math.floor(Math.random() * length)
		while(values[r] != undefined) {
			r += 1
			r %= length
		}
		values[r] = Math.floor(j);
	}
	return values
}

let id = (i) => i
let setCurrent = (i, total) => {
	let current = Array(total).fill(false)
	current[i] = true
	return current
}

let initialGameState = (timerInterval, side) => {
	const l = side * side
	const matches = Array(l).fill(false)

	const values = getShuffledValues(side)
	const choices = Array(l).fill(false)
	const current = setCurrent(Math.floor(Math.random() * l), l)
	return {choices, score:0, time:0, won:false, hits:[], misses:[], lastActionTime:0, overlay:'', values, matches, current, timerInterval}
}

let Session = React.createClass({
	getInitialState() { return { name:'', email:'' }},
	handleProfileAdd(name, email) { 
		this.setState({name, email})
	},
	render() {
		return (<Game side={4} name={this.state.name} email={this.state.email} onProfileAdd={this.handleProfileAdd}/>);
	}
})

let Game = React.createClass({
	propTypes: {
		side: React.PropTypes.number.isRequired,
		name: React.PropTypes.string.isRequired,
		email: React.PropTypes.string.isRequired,
		onProfileAdd: React.PropTypes.func.isRequired,
	},
	getInitialState() {
		const timerInterval = this.getTimer()
		return initialGameState(timerInterval, this.props.side)
	},
	getDefaultProps() { return {side:4} },
	handleReset() {
		const timerInterval = this.getTimer()
		const state = initialGameState(timerInterval, this.props.side)
		this.setState(state)
	},
	getTimer(seconds=1) {
		if(this.state && this.state.timerInterval)
			clearInterval(this.state.timerInterval)
		return setInterval(() => this.setState({time: this.state.time + 1}), seconds * 1000)
	},
	compareChoices() {
		if(this.state.won) { return }

		const choices = this.state.choices.map((e,i) => e || this.state.current[i])
		this.setState({choices})

		if(choices.filter(id).length < 2) { return }

		const equal = choices.map((e,i) => e && this.state.values[i]).filter(id).slice(0,2).reduce((a,b) => a == b)
		const time_delta = this.state.time - this.state.lastActionTime
		let newState, hit = false
		if(equal) {
			const newMatched = choices.map((e,i) => e || this.state.matches[i])
			const won = newMatched.every(id)
			if(won) { clearInterval(this.state.timerInterval) }
			hit = true
			newState = {
				score: this.state.score + 1,
				hits: this.state.hits.concat([time_delta]),
				matches: newMatched,
				won
			}
		} else {
			newState = {
				score: this.state.score - 1,
				misses: this.state.misses.concat([time_delta]),
			}
		}
		newState['choices'] = Array(Math.pow(this.props.side, 2)).fill(false)
		newState['lastActionTime'] = this.state.time

		setTimeout(() => {
			this.setState(newState)
			if(hit) this.moveCurrent(1)
			//setTimeout(() => this.setState({overlay:''}), 500)
		}, 1000)
	},
	moveCurrent(a) {
		if(this.state.won) { return }

		const t = Math.pow(this.props.side, 2)
		let i = this.state.current.findIndex(id)
		i += a
		i %= t
		i += (i < 0) ? t : 0

		if(this.state.matches.filter(id).length < t) {
			while(this.state.matches[i]) {
				i += a
				i %= t
				i += (i < 0) ? t : 0
			}

			this.setState({current: setCurrent(i, t)});
		}
	},
	handleLeft(){ this.moveCurrent(-1) },
	handleRight(){this.moveCurrent(+1) },
	handleUp(){   this.moveCurrent(-this.props.side) },
	handleDown(){ this.moveCurrent(+this.props.side) },
	handleEnter(){this.compareChoices()},
	render() {
		return (
			<div>
			<Board values={this.state.values} overlay={this.state.overlay}
				matches={this.state.matches} score={this.state.score} 
				timeElapsed={this.state.time} onReset={this.handleReset} 
				hits={this.state.hits} misses={this.state.misses}
				won={this.state.won} side={this.props.side}
				name={this.props.name} email={this.props.email}
				current={this.state.current} onProfileAdd={this.props.onProfileAdd}
				choices={this.state.choices} />
			<BoardActions 
				onLeft={this.handleLeft} 
				onRight={this.handleRight} 
				onUp={this.handleUp} 
				onDown={this.handleDown} 
				onEnter={this.handleEnter}
				onReset={this.handleReset} />
			</div>
		);
	}
})

let Board = React.createClass({
	propTypes: {
		side: React.PropTypes.number.isRequired,
		won: React.PropTypes.bool.isRequired,
		overlay: React.PropTypes.string.isRequired,
		name: React.PropTypes.string.isRequired,
		email: React.PropTypes.string.isRequired,
		choices: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
		matches: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
		current: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
		values: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
		score: React.PropTypes.number.isRequired,
		timeElapsed: React.PropTypes.number.isRequired,
		onReset: React.PropTypes.func.isRequired,
		onProfileAdd: React.PropTypes.func.isRequired,
	},	
	render() {
		let actionButton
		if(this.props.won) {
			actionButton = "Start New Game"
		} else {
			actionButton = "Restart"
		}
		return (
			<div>
				<div style={{float:'left', margin: 'auto'}}>
					{this.props.won ? 
						<Profile score={this.props.score} name={this.props.name} email={this.props.email} 
						onProfileAdd={this.props.onProfileAdd} hits={this.props.hits} misses={this.props.misses} />:
						<Grid 
							side={this.props.side} 
							values={this.props.values} 
							matches={this.props.matches} 
							current={this.props.current}
							choices={this.props.choices} 
							won={this.props.won} />}
				</div>
				<div className="right column">
					<div className="logo"/>
					<GameInfo score={this.props.score} time={this.props.timeElapsed} hits={this.props.hits} misses={this.props.misses} won={this.props.won}/>
					<RestartButton onClick={this.props.onReset}>{actionButton}</RestartButton>
				</div>
			</div>
		);
	}
});

let GameInfo = React.createClass({
	propTypes: {
		won: React.PropTypes.bool.isRequired,
		time: React.PropTypes.number.isRequired,
		hits: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
		misses: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
		score: React.PropTypes.number.isRequired,
	},
	render() {
		const common = <span>
			<dt>Time: <b>{this.props.time}</b></dt>
			<dt>Hits: <b>{this.props.hits.length}</b></dt>
			<dt>Misses: <b>{this.props.misses.length}</b></dt>
			<dt>Score: <b>{this.props.score}</b></dt>
			</span>
		return <dl>{common}</dl>
	}
});

let RestartButton = React.createClass({
	propTypes: {
		onClick: React.PropTypes.func.isRequired,
	},	
	handleClick(e) {
		e.target.blur()
		this.props.onClick()
	},
	render() {
		return <button onClick={this.handleClick}>{this.props.children}</button>
	}
})

let GridOverlay = React.createClass({
	propTypes: {
		overlay: React.PropTypes.string.isRequired,
	},
	render() {
		//const style = {position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -70%)', zIndex: 1}
		const style = {paddingLeft: '10px', paddingRight: '10px', zIndex: 1}
		const children = React.Children.toArray(this.props.children)
		return (
			<div style={{position: 'relative', float:'left'}}>
				<div style={style}>{children[0]}</div>
				<div style={{zIndex: 0, opacity: 0.1}}>{(children.length > 1) ? children[1] : null}</div>
			</div>
		);
	}
})

let Profile = React.createClass({
	propTypes: {
		score: React.PropTypes.number.isRequired,
		name: React.PropTypes.string.isRequired,
		email: React.PropTypes.string.isRequired,
		hits: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
		misses: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
		onProfileAdd: React.PropTypes.func.isRequired,
	},
	getInitialState() { return {loadingFailed:false}},
	handleSubmit(name, email) {
		this.props.onProfileAdd(name, email)
	},
	handleFail(){
		this.setState({loadingFailed:true})
	},
	render() {
		const name = this.props.name 
		const email = this.props.email

		if(this.state.loadingFailed) {
			return <ProfileLoadingFailed score={this.props.score} name={name} hits={this.props.hits} misses={this.props.misses} />
		}
		if(name == '' || email == "")
			return <ProfileForm score={this.props.score} onSubmit={this.handleSubmit} />
		else
			return (<ProfileScores score={this.props.score} name={name} email={email} 
			onFail={this.handleFail} url='http://localhost:8000/scores.json/' />)
	}
})

let ProfileForm = React.createClass({
	propTypes: {
		score: React.PropTypes.number.isRequired,
		onSubmit: React.PropTypes.func.isRequired
	},
	getInitialState() { return {name:'', email:''}},
	handleSubmit(e) { 
		e.preventDefault();
		this.props.onSubmit(this.state.name, this.state.email)
	},
	handleNameChange(e) { this.setState({name: e.target.value}) },
	handleEmailChange(e) { this.setState({email: e.target.value}) },	
	render() {
		return (
		<form onSubmit={this.handleSubmit} style={{margin: 'auto', textAlign: 'center', width: '210px'}}>
			<p>Please enter your name and email to continue</p><br />
			<input type="text" placeholder="Your Name" value={this.state.name} onChange={this.handleNameChange}/><br />
			<input type="email" placeholder="Your Email" value={this.state.email} onChange={this.handleEmailChange}/><br />
			<input type="hidden" value={this.props.score}/><br />
			<span>Your score is {this.props.score}</span><br />
			<input type="submit" />
		</form>)	
	}	
})

let ProfileScores = React.createClass({
	propTypes: {
		score: React.PropTypes.number.isRequired,
		email: React.PropTypes.string.isRequired,
		name:  React.PropTypes.string.isRequired,
		url:  React.PropTypes.string.isRequired,
		onFail: React.PropTypes.func.isRequired,
	},
	getInitialState() {
		return { scores: [], rank: 0 }
	},
	componentDidMount() {
		const d = {
			score:this.props.score,
			email:this.props.email,
			name:this.props.name,
		}
		this.serverRequest = $.getJSON(this.props.url, d, function(data) {
			let rank = data.rank
			let scores = data.scores
			setTimeout(() => this.setState({scores, rank}), 1000)
		}.bind(this)).fail((e) => {
			this.props.onFail()
		}.bind(this))
	},
	componentWillUnmount() {
		this.serverRequest.abort()
	},
	render() {
		if(this.state.scores.length > 0) {
			return (
			<div style={{display: 'block', overflow: 'auto', margin: 'auto', textAlign: 'center', width: '210px'}}>
				<h4>You are ranked {this.state.rank}</h4>
				<h5>Top {this.state.scores.length} Scores</h5>
				<ol>{this.state.scores.map((s, i) => <li key={i}>{s.name + ' scored ' + s.score}</li>)}</ol>
			</div>)
		} else {
			return <h4>Loading your rank...</h4>
		}
	}
})

let ProfileLoadingFailed = React.createClass({
	propTypes: {
		score: React.PropTypes.number.isRequired,
		name:  React.PropTypes.string.isRequired,
		hits: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
		misses: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,		
	},
	render() {
		const hits = this.props.hits.sort().slice(0, 3)
		return (
			<div style={{display: 'block', overflow: 'auto', margin: 'auto', textAlign: 'center', width: '210px'}}>
				<h4>Well done {this.props.name}, your score is {this.props.score}!</h4>
				<h5>Your top {hits.length} plays are</h5>
				<ol>{hits.map((s,i) => <li key={i}>Hit in {s} seconds</li>)}</ol>
			</div>)
	}
})

let Grid = React.createClass({
	propTypes: {
		side: React.PropTypes.number.isRequired,
		choices: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
		matches: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
		current: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
		values: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
	},
	render() {
		let slotRows = []
		const side = this.props.side
		const won = this.props.won
		for(let row = 0; row < side; row++) {
			const start = row * side
			const end = start + side
			const values =  this.props.values.slice(start, end)
			const current = this.props.current.slice(start, end).map(c => won ? false : c)
			const choices = this.props.choices.slice(start, end).map(c => won ? true : c)
			const matches = this.props.matches.slice(start, end).map(c => won ? false : c)
			const slotRow = <SlotRow 
					data={values} key={row} 
					choices={choices} 
					matches={matches} 
					current={current} />
			slotRows.push(slotRow)
		}
		return (<table><tbody>{slotRows}</tbody></table>)
	}
});

let SlotRow = React.createClass({
	propTypes: {
		data: React.PropTypes.array.isRequired,
		choices: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
		matches: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
		current: React.PropTypes.arrayOf(React.PropTypes.bool).isRequired,
	},
	render() {
		const slots = this.props.data.map((v,i) =>
			<Slot 
				data={v} key={i}
				flipped={this.props.choices[i]} 
				remove={this.props.matches[i]} 
				select={this.props.current[i]} />)
		return <tr>{slots}</tr>
	}
})

let Slot = React.createClass({
	propTypes: {
		flipped: React.PropTypes.bool.isRequired,
		select: React.PropTypes.bool.isRequired,
		data: React.PropTypes.number.isRequired,
	},
	render() {
		let className = 'card ' 
		className += (this.props.flipped? ' flipped' : '') 
		className += (this.props.remove ? ' remove ' : '')
		className += (this.props.select ? ' select ' : '')

		const faceClass = "front face" + this.props.data
		return ( 
			<td>
				<section className="container">
				<div className={className}>
					<figure className={faceClass}>{/*this.props.data*/}</figure>
					<figure className="back"></figure>
				</div>
				</section>
			</td>
		)
	}
})

let BoardActions = React.createClass({
	propTypes: {
		onDown: React.PropTypes.func.isRequired,
		onUp: React.PropTypes.func.isRequired,
		onLeft: React.PropTypes.func.isRequired,
		onRight: React.PropTypes.func.isRequired,
		onEnter: React.PropTypes.func.isRequired,
		onReset: React.PropTypes.func.isRequired,
	},
	handleKeyPress(e) {
		const o = {
			"ARROWDOWN": this.props.onDown,
			"ARROWUP": this.props.onUp,
			"ARROWLEFT": this.props.onLeft,
			"ARROWRIGHT": this.props.onRight,
			"ENTER": this.props.onEnter,
		}
		const key = e.key.toUpperCase()
		if(key in o) { o[key]() }
	},
	componentWillMount(){ 
		document.addEventListener("keydown", this.handleKeyPress, false)
	},
	componentWillUnmount() {
		document.removeEventListener("keydown", this.handleKeyPress, false)
	},
	render() { return <span></span> }
})

ReactDOM.render(<Session />, document.getElementById('content'))