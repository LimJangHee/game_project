const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#score')

// 브라우저 윈도우 사이즈 적용
canvas.width = window.innerWidth
canvas.height = window.innerHeight

// 맵 환경 생성 및 설정
class Boundary {
    static width = 40
    static height = 40
    constructor({ position }) {
        this.position = position
        this.width = 40
        this.height = 40
    }

    draw() {
        c.fillStyle = 'blue'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

// 플레이어 클래스
class Player {
    constructor({position, velocity}) {
        
        this.position = position
        this.velocity = velocity
        this.radius = 15
        // 입 벌리는 값
        this.radians = 0.75
        // 입 열고 닫는 속도값 조정
        this.openRate = 0.02
        this.rotation = 0
    }

    // 플레이어를 노란 원으로 그리기
    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = "yellow"
        c.fill()
        c.closePath()
        c.restore()
    }

    
    update() {
        // 키 이벤트 발생에 대한 플레이어 위치값 업데이트
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // 입을 열었다 닫았다 할 수 있게끔 업데이트
        if (this.radians < 0 || this.radians > .75) this.openRate = -this.openRate

        this.radians += this.openRate
    }
}

// Ghost 클래스
class Ghost {
    constructor({position, velocity, color = 'red'}) {
        
        this.position = position
        this.velocity = velocity
        this.radius = 18
        this.color = color
        this.prevCollisions = []
        this.scared = false
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        // 공포일 경우 파란색 통일, 아닐경우 할당 색으로
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }

    // 키 이벤트 발생에 대한 플레이어 위치값 업데이트
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}


// 코인 클래스
class Pellet {
    constructor({position, velocity}) {
        
        this.position = position
        this.radius = 3
    }

    
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = "white"
        c.fill()
        c.closePath()
    }

}

// 파워업 클래스
class PowerUp {
    constructor({position, velocity}) {
        
        this.position = position
        this.radius = 8
    }

    
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = "white"
        c.fill()
        c.closePath()
    }

}

// 코인 저장용 배열
const pellets = []


// 경계선 추가할 배열
const boundaries = []

// 파워업 코인 저장용 배열
const powerUps = []

// ghost 초기 정보
const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: 2,
            y: 0
        }
    }),
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height * 3 + Boundary.height / 2
        },
        velocity: {
            x: 2,
            y: 0
        },
        color: 'pink'
    }),
]


// 플레이어 선언, 위치정보
const player = new Player({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }

})

// 키에 대한 변수 할당, 중복으로 누르는거 방지위해
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

// 키 중복으로 입력 방지용으로 키 입력시 해당 변수에 저장하여 if문에서 같이 제어
let lastKey = ''

// 점수 저장용 변수
let score = 0

// 맵 뼈대
const map = [
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '-'],
    ['-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-'],
    ['-', '.', '.', '.', '.', '-', '.', '.', '.', '.', '-'],
    ['-', '.', '-', '-', '.', '.', '.', '-', '-', '.', '-'],
    ['-', '.', '.', '.', '.', '-', '.', '.', '.', '.', '-'],
    ['-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-'],
    ['-', '.', '.', '.', '.', '-', '.', '.', '.', '.', '-'],
    ['-', '.', '-', '-', '.', '.', '.', '-', '-', '.', '-'],
    ['-', '.', '.', '.', '.', '-', '.', '.', '.', '.', '-'],
    ['-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-'],
    ['-', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
]

// 반복문으로 맵 뼈대에 해당하는 경계선 생성하여 배열에 추가
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            // 경계선에 해당하는 경우
            case '-':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        }
                    })
                )
                break
            // 통로인 경우    
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                ) 
                break
            // 파워업 코인 지정용
            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                ) 
                break          
        }
    })
})

// 충돌 조건 함수화
function circleCollideWithRectangle({
    circle, rectangle
}) {
    // const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height //+ padding
        && 
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x //- padding
        &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y //- padding
        &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width //+ padding
    )
}


let animationID
// 애니메이션 함수 정의(플레이어 등을 지속적으로 움직이게 하기 위해서 필요)
function animate() {
    animationID = requestAnimationFrame(animate)
    
    // 잔상제거용(없으면 플레이어 따라 잔상 쭉 생김)
    c.clearRect(0 ,0, canvas.width, canvas.height)

    // 플레이어 실제로 그리기
    player.update()
    player.velocity.x = 0
    player.velocity.y = 0


    // 맵 실제로 그리기
    boundaries.forEach((boundary) => {
        boundary.draw()

        // 충돌 조건
        if (
            // player.position.y - player.radius + player.velocity.y <= boundary.position.y + boundary.height 
            // && 
            // player.position.x + player.radius + player.velocity.x >= boundary.position.x
            // &&
            // player.position.y + player.radius + player.velocity.y >= boundary.position.y
            // &&
            // player.position.x - player.radius + player.velocity.x <= boundary.position.x + boundary.width
            circleCollideWithRectangle({
                circle: player,
                rectangle: boundary,
            })
        ) {
            // 충돌 테스트
            // console.log('colliding')
            player.velocity.x = 0
            player.velocity.y = 0


        } 
    })
    player.update()

    // 플레이어와 Ghost 충돌 감지
    for (let i = ghosts.length - 1; 0 <= i; i--) {
      const ghost = ghosts[i]
        // 플레이어와 Ghost 충돌했을시
        if (
          Math.hypot(
            ghost.position.x - player.position.x,
            ghost.position.y - player.position.y
          ) <
            ghost.radius + player.radius
        ) {

            if (ghost.scared) {
                ghosts.splice(i, 1)
            } else {
            cancelAnimationFrame(animationID)
            // 패배 조건 확인
            console.log('game over')
            }
        }
    }
    // 승리 조건
    if (pellets.length === 0) {
        console.log('you win')
        cancelAnimationFrame(animationID)
    }    

    // 파워업 코인 생성
    powerUps.forEach((PowerUp, i) => {
        PowerUp.draw()

        // 플레이어와 충돌시 조건
        if (
            Math.hypot(
                PowerUp.position.x - player.position.x,
                PowerUp.position.y - player.position.y
            ) <
            PowerUp.radius + player.radius
        ) {
            powerUps.splice(i, 1)

            ghosts.forEach(ghost => {
                ghost.scared = true

                setTimeout(() => {
                    ghost.scared = false
                }, 5000) 
            })
        }
    })
    

    // 코인 생성
    pellets.forEach((pellet, i) => {
        pellet.draw()

        // 플레이어와 충돌시 조건
        if (Math.hypot(pellet.position.x - player.position.x, 
            pellet.position.y - player.position.y) <
         pellet.radius + player.radius) {
            
            // 코인, 플레이어 충돌 확인용
            // console.log('touching')
            // 충돌했을시 코인 삭제, 점수 올리고, 해당 점수 적용
            pellets.splice(i, 1)
            score += 100
            scoreEl.innerHTML = score
         }
    })

    // Ghost 생성
    ghosts.forEach(ghost => {
        ghost.update()

       

        const collisions = []
        // 충돌 조건, 방향 중복 체크
        boundaries.forEach(boundary => {
            if (
                // 중복으로 방향 설정되는거에 대한 체크 목적
                !collisions.includes('right') &&
                circleCollideWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 2,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('right')
            }

            if (
                !collisions.includes('left') &&
                circleCollideWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: -2,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('left')
            }

            if (
                !collisions.includes('up') &&
                circleCollideWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: -2
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('up')
            }

            if (
                !collisions.includes('down') &&
                circleCollideWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: 2
                        }
                    },
                    rectangle: boundary
                })
            ) {
                collisions.push('down')
            }
        })
        // 충돌 확인용
        console.log(collisions)


        if (collisions.length > ghost.prevCollisions.length)
        ghost.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)){
            // console.log('go')

            // 선택 가능한 경로 조인시 경로 선택할 수 있게끔 추가
            if (ghost.velocity.x > 0)
            ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0)
            ghost.prevCollisions.push('left')
            else if (ghost.velocity.y < 0)
            ghost.prevCollisions.push('up')
            else if (ghost.velocity.y > 0)
            ghost.prevCollisions.push('down')

            // 충돌 확인
            console.log(collisions)
            console.log(ghost.prevCollisions)

            // 현재 충돌 상태가 아닌 객체들만 반환하여 경로에 추가
            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision)
            })

            // 진행 가능 경로 확인
            console.log({ pathways })

            // 랜덤 방향으로 진행
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            // 각 방향 진행에 대한 속도 조건
            console.log({ direction })
            switch (direction) {
                case 'down':
                    ghost.velocity.y = 2
                    ghost.velocity.x = 0
                    break

                case 'up':
                    ghost.velocity.y = -2
                    ghost.velocity.x = 0
                    break    
                
                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = 2
                    break

                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -2
                    break
            }

            // reset용
            ghost.prevCollisions = []
        }
    })

    

    // // 초기화 해줘서 계속 가는거 제어
    // player.velocity.x = 0
    // player.velocity.y = 0
    
    // 키 눌른거에 대한 실질적 제어
    if (keys.w.pressed && lastKey === 'w') {
        // 전체 테두리에 대해서 충돌 조건 확인 후 속도 제어
        // 외부 테두리 뿐만 아니라 내부 테두리 중에 공간이 있을 경우 빠져나가기 위해서 필요
        for(let i = 0; i < boundaries.length; i++) {
          const boundary = boundaries[i]  
            if ( circleCollideWithRectangle({
                // 팁!!! player객체를 복제하여 velocity속성을 추가한 다음 circle이라는 새로운 객체를 생성하는 스프레드 문법
                circle: {...player, velocity: {
                    x: 0,
                    y: -2
                }},
                rectangle: boundary
            })) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = -2
            }
        }    

    } else if (keys.a.pressed && lastKey === 'a') {
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]  
              if ( circleCollideWithRectangle({
                  circle: {...player, velocity: {
                      x: -2,
                      y: 0
                  }},
                  rectangle: boundary
              })) {
                  player.velocity.x = 0
                  break
              } else {
                  player.velocity.x = -2
              }
          }    
    } else if (keys.s.pressed && lastKey === 's') {
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]  
              if ( circleCollideWithRectangle({
                  circle: {...player, velocity: {
                      x: 0,
                      y: 2
                  }},
                  rectangle: boundary
              })) {
                  player.velocity.y = 0
                  break
              } else {
                  player.velocity.y = 2
              }
          }    
    } else if (keys.d.pressed && lastKey === 'd') {
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]  
              if ( circleCollideWithRectangle({
                  circle: {...player, velocity: {
                      x: 2,
                      y: 0
                  }},
                  rectangle: boundary
              })) {
                  player.velocity.x = 0
                  break
              } else {
                  player.velocity.x = 2
              }
          }    
    }
    // 플레이어 실제로 그리기
    // player.update()

    // 방향 틀었을 경우 팩맨의 입 방향 설정에 대한 조건
    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
    
}

// 애니메이션 함수 호출하여 실행
animate()



// 키 눌렀을때의 이벤트 설정
window.addEventListener('keydown', ({key}) => {
    // 확인용
    // console.log(key)
    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break 
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break                   
}
    // 확인용
    // console.log(keys.w.pressed)
    // console.log(keys.a.pressed)
    // console.log(keys.s.pressed)
    // console.log(keys.d.pressed)
})

// 키에서 손 땟을때 멈추게끔 이벤트 설정
window.addEventListener('keyup', ({key}) => {
    // 확인용
    // console.log(key)
    switch (key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break 
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break                   
}
    // 확인용
    // console.log(keys.w.pressed)
    // console.log(keys.a.pressed)
    // console.log(keys.s.pressed)
    // console.log(keys.d.pressed)
})