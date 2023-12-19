const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

const endPoint = 'planets.json';

let countFrom = 10;

let planets = getPlanets();

function getPlanets() {
	fetch(endPoint)
	.then(response => response.json())
	.then(data => planets = data)
	.then(() => startGame())
	.catch(err => console.log(err))
}

function startGame() {
	const containerElement = document.querySelector('.container');
	const homeButton = document.createElement('div');
	homeButton.classList.add('button__home');
	homeButton.textContent = 'Return to lunar base';
	const lunarBase = document.createElement('img');
	lunarBase.classList.add('lunar__base');
	lunarBase.src = 'assets/images/moon.png';
	lunarBase.style.transform = `scale(2) translateY(${winHeight - 480}px)`
	const header = document.createElement('div');
	header.classList.add('header__message');
	header.innerHTML = "<h1>Welcome Commander <span>Ida</span></h1>";
	const missionControl = document.createElement('div');
	const mission = document.createElement('ul');
	mission.textContent = "Where are we going today?";
	mission.classList.add('missions');
	planets.forEach((p, index) => {
		missionOption = document.createElement('li');
		missionOption.setAttribute('num', index);
		missionOption.textContent = p.name;
		mission.appendChild(missionOption);
	})
	const rocketShip = document.createElement('div');
	rocketShip.classList.add('card__ship');
	rocketShip.innerHTML = `<img class='spaceship' src='assets/images/spaceship4.png'></img>`;
	rocketShip.style.transform = `translateX(0vw) translateY(42vh)`;
	const countDown = document.createElement('div');
	countDown.classList.add('countdown');
	countDown.innerHTML = "Countdown";
	const blastOff = document.createElement('p');
	blastOff.classList.add('count');
	blastOff.textContent = countFrom;
	countDown.appendChild(blastOff);
	containerElement.appendChild(homeButton);
	containerElement.appendChild(lunarBase);
	containerElement.appendChild(header);
	containerElement.appendChild(rocketShip);
	containerElement.appendChild(countDown);
	containerElement.appendChild(mission);
	homeButton.addEventListener('click', backHome);
	mission.addEventListener('click', launchRocket);
}

function launchRocket(e) {
	const headerMessage = document.querySelector('.header__message');
	headerMessage.innerHTML = `<h1>Ida is going to ${e.target.textContent}</h1>`; 
	// start countDown timer
	countDownClock = setInterval(countDown ,1000, e);
	// disappear mission control
	const containerElement = document.querySelector('.container');
	const missionControl = document.querySelector('.missions');
	containerElement.removeChild(missionControl);
}

function startMission(e) {
	// remove countdown
	clearInterval(countDownClock);
	const containerElement = document.querySelector('.container');
	const headerMessage = document.querySelector('.header__message');
	const countDown = document.querySelector('.countdown');
	headerMessage.innerHTML = `<h1>Blast off to ${e.target.textContent}</h1>` 
	containerElement.removeChild(countDown);
	missionTo = destinationPlanet(e)
	liftOff();
	transitPlanets(e);
	//moon smaller
	// moon lower
	// first transit grows and moves left

}

function destinationPlanet(e) {
	const destination = parseInt(e.target.attributes[0].nodeValue);
	const containerElement = document.querySelector('.container');
	const planet = document.createElement('img');
	planet.classList.add('planet', 'destination');
	planet.src = `assets/images/${planets[destination].filename}`;
	containerElement.appendChild(planet);
	return planets[destination];
}


function transitPlanets(e) {
	const destination = parseInt(e.target.attributes[0].nodeValue);
	// what planets will we pass
	let transitPlanets = destination > 2? planets.slice(3, destination): planets.slice(destination + 1, 3).reverse();
	console.log(transitPlanets);
	displayPlanets(transitPlanets);
	const duration = winWidth / 2;
	const initialScale = 0.01;
	const initialShift = 1;
	flyBy();
	setTimeout(() => {
		flight(planets[destination], duration, initialScale, initialShift)
	}, (transitPlanets.length + 2) * 10000);
}

function displayPlanets(transitPlanets) {
	const containerElement = document.querySelector('.container');
	transitPlanets.forEach((t, index) => {
		const planet = document.createElement('img');
		planet.classList.add('planet');
		planet.setAttribute('num', index);
		planet.src = `assets/images/${t.filename}`;
		containerElement.appendChild(planet);
	})
}

function flyBy() {
	const transit = document.querySelectorAll('.planet');
	const planets = Array.from(transit).slice(1);
	planets.forEach((planet, index) => {
		console.log(planet);
		setTimeout(() => {
			passBy(planet);
			const headerMessage = document.querySelector('.header__message');
			headerMessage.innerHTML = `<h1>Cruising past ${parseInt(planet.attributes[1].nodeValue)}</h1>`; 
		}, index * 20000)
	});
} 

const passBy = async (planet) => {
	for (let i=0; i <= 100; i++) {
		await delay(200); 
		planetPass(planet, i);
	}
}

function planetPass(planet, i) {
	shift = 1.1;
	scale = 0.01;
	planet.style.transform = `translateX(${-Math.pow(shift, i)}px) scale(${Math.pow((1 + scale), i) -1 }) rotate(${i*0.5}deg`;
}

function flight(mission, duration, scale, shift) {
	// spaceship tilts left
	// spaceship goes up and shrinks to 50%

	const spaceShip = document.querySelector('.spaceship');
	spaceShip.style.transform = `rotate(${-1}deg) scale(${1})` 
	const shipCard = document.querySelector('.card__ship');
	const shipShift = Math.max(winHeight * 0.42 - shift, 0);
	shipCard.style.transform = `translateX(${0}px) translateY(${shipShift}px)` 

	// destination planet moves left toward the centre and grows
	scale = scale * 1.01;
	shift = shift * 1.013; 
	const destinationPlanet = document.querySelector('.destination');
	destinationPlanet.style.transform = `translateX(-${shift}px) translateY(${shift/3}px) scale(${scale})`;
	// once it is reached it stops growing and we orbit
	const transit = setTimeout(flight, 50, mission, duration, scale, shift)
	if (shift > duration) {clearTimeout(transit)}
	// const orbit = shipCard.getBoundingClientRect().y <= winHeight * 0.15 ? 1: 0;
	// console.log(shipCard.getBoundingClientRect().y); 
	const orbit = shipShift <= 200 ? 1: 0;

	if (orbit) {
		console.log(mission);
		const headerMessage = document.querySelector('.header__message');
		headerMessage.innerHTML = `<h1>Orbit around ${mission.name}</h1>`

		orbitPlanet(1, mission);
	}
}

function orbitPlanet(rotation) {
	const shipCard = document.querySelector('.card__ship');
	rotation = rotation + 5;
	shipCard.style.rotate = `${rotation}deg`;
	orbitFlight = setTimeout(orbitPlanet, 5000, rotation)
}

function backHome() {
	location.reload();
}

function countDown(e) {
	const blastOff = document.querySelector('.count');
	const spaceShip = document.querySelector('.spaceship');
	blastOff.textContent = countFrom;
	countFrom--;
	countFrom == 2? ignition() :null;
	countFrom < 0? startMission(e): null;
}


function ignition() {
	const spaceShip = document.querySelector('.spaceship');
	setInterval(() => 
	{
		spaceShip.src = spaceShip.src.split('/').slice(-1) == 'spaceship.png'? 'assets/images/spaceship5.png': 'assets/images/spaceship.png'; 
	}, 431)
}

function liftOff() {
	const lunarBase = document.querySelector('.lunar__base');
	let i = 1;
	const liftoff = setInterval(() => {		
		lunarBase.style.transform = `scale(2) translateY(${winHeight - 480 + i * 3 * 4}px)`;
		i = i + 1;
		if (i >= 24) {clearInterval(liftoff)};

	}, 50);
}

const delay = ms => new Promise(res => setTimeout(res, ms));


// ------------------------ *********************** --------------------------------
addNavbar();

function addNavbar() {
	const navbarElement = document.getElementById('navbar');
	const navbarContent = `
		<div class="nav__logo">
			<img src="assets/images/poor_giraffe.png">
		</div>
		<div class="hamburger__toggle">
			<div class="hamburger"></div>
		</div>
		<ul class="nav__items">
			<li class="nav__item"><a href="/Tom_Jerry"><p>Bugs</p></a></li>
			<li class="nav__item"><a href="../../Ania/chess/index.html">Chess</a></li>
			<li class="nav__item"><a href="/space">Space</a></li>
			<li class="nav__item"><a href="/clock">Clock</a></li>
			<li class="nav__item"><a href="file:///Users/Paul/Projects/FargoChronicle/index.html">Chronicle</a></li>
		</ul>
`;
	navbarElement.innerHTML = navbarContent;

	const hamburgerToggle = document.querySelector('.hamburger__toggle');
	const hamburger = document.querySelector('.hamburger');
	const navItems = document.querySelector('.nav__items');

	hamburgerToggle.addEventListener('click', (e) => {
		hamburger.classList.toggle('active');
		navItems.classList.toggle('active');
	})
}
