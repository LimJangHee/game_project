## HTML, CSS, JS 기반 PACMAN 게임 구현
### 1. 시작화면, 난이도 선택

![시작화면](https://github.com/LimJangHee/game_project/assets/108971000/1e9c9f37-1159-496e-a582-3b67613b340d)<br>
* 4초간 난이도 선택할 시간이 주어지며 선택을 하지 않을 경우 Easy 난이도가 적용된다.
* 난이도 : Easy = Ghost 1기,  Medium = Ghost 2기,  Hard = Ghost 3기

### 2. 게임화면

![게임화면](https://github.com/LimJangHee/game_project/assets/108971000/bd8026fb-a8ba-4b54-8c87-94f6c2c9baec)<br>
* 게임 목표 : 노란색 원이 플레이어이며 필드에 있는 Ghost들을 피해 모든 코인(pellet)들을 먹으면 승리!
* 이동키 : w, s, a, d 
* PowerUp : 5시 방향에 있는 큰 코인(pellet)을 먹으면 5초간 Ghost들을 역으로 공격할 수 있으며 Ghost를 잡으면 1000점 획득!!(코인의 경우 100점 획득)

### 3. 플레이 하기 
https://limjanghee.github.io/game_project/game_project/index.html

### 4. 미완성, 수정 필요한 부분

* 난이도 중복으로 클릭하면 Ghost가 계속 추가됨(그래서 현재 1번만 클릭해야됨)<br> 
  -> 중복으로 클릭해도 선택 & 출력된 난이도에 맞는 숫자의 Ghost만 추가되게
* 현재 restart 버튼을 누르면 html 페이지를 '새로고침' 하는 방법으로 재시작<br>
  -> 게임 데이터를 모두 초기화해서 바로 restart를 하려고 구현해 보았으나<br> splice된 객체의 초기화 상의 문제,<br> 초기화된 객체들이 기존에 걸어 놓은 특정 조건에 따른 구현된 기능이 적용이 안되서 보류
* 맵과 플레이어 사이의 충돌 조건이 많이 타이트한 부분(통로 들어갈때 딱 맞게 들어가지 않으면 잘 안들어가짐)<br>
  -> 플레이어 사이즈를 줄여 어느정도 보완은 하였지만 충돌 조건 자체를 수정할 필요성 있음  
        

