// DOOM-Style 3D FPS Game with Three.js
class Doom3D {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        this.canvas = null;
        this.originalCanvas = null;
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = new THREE.Raycaster();
        
        // Game objects
        this.player = { health: 100, ammo: 50, armor: 0 };
        this.enemies = [];
        this.walls = [];
        this.pickups = [];
        this.bullets = [];
        
        // Movement
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Flashlight state
        this.flashlightOn = true;
        
        // Store hit indicator for crosshair
        this.lastHitTime = 0;
        
        // Mouse look
        this.mouseX = 0;
        this.mouseY = 0;
        this.isPointerLocked = false;
        
        // Game state
        this.enemySpawnTimer = 0;
        this.enemySpawnRate = 3;
        this.wave = 1;
        this.kills = 0;
        
        this._keyHandler = null;
        this._keyUpHandler = null;
        this._mouseHandler = null;
        this._clickHandler = null;
        this._pointerLockChange = null;
    }

    init(canvas, ctx) {
        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js not loaded!');
            this.gameOver = true;
            return;
        }

        console.log('🎮 Initializing DOOM-style 3D FPS...');
        
        this.originalCanvas = canvas;
        this.score = 0;
        this.gameOver = false;
        
        try {
            this._initThreeJS();
            this._createLevel();
            this._createPlayer();
            this._spawnInitialEnemies();
            this._bindControls();
            this._setupPointerLock();
            console.log('✅ DOOM 3D initialized!');
        } catch (error) {
            console.error('❌ Error initializing DOOM 3D:', error);
            this.gameOver = true;
        }
    }

    _initThreeJS() {
        // Create WebGL canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.originalCanvas.width;
        this.canvas.height = this.originalCanvas.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.cursor = 'crosshair';
        
        const container = this.originalCanvas.parentElement;
        container.style.position = 'relative';
        this.originalCanvas.style.display = 'none';
        container.appendChild(this.canvas);

        // Scene with fog
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Tam siyah
        this.scene.fog = new THREE.FogExp2(0x000000, 0.05); // Yoğun sis

        // First-person camera - sabit rotation order
        this.camera = new THREE.PerspectiveCamera(
            90, // Daha geniş görüş açısı
            this.canvas.width / this.canvas.height,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 0); // Eye level
        this.camera.rotation.order = 'YXZ'; // Sabit rotation sırası

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: false // Retro look
        });

        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(1); // Pixelated retro look

        // Gelişmiş aydınlatma - Daha parlak ve atmosferik
        const ambientLight = new THREE.AmbientLight(0x202040, 0.6); // Daha parlak ambient
        this.scene.add(ambientLight);

        // Ana ışık kaynağı (yukarıdan)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(0, 20, 0);
        this.scene.add(mainLight);

        // Renkli atmosferik ışıklar
        const redLight1 = new THREE.PointLight(0xff0000, 1.5, 30);
        redLight1.position.set(-15, 3, -15);
        this.scene.add(redLight1);

        const redLight2 = new THREE.PointLight(0xff0000, 1.5, 30);
        redLight2.position.set(15, 3, 15);
        this.scene.add(redLight2);

        const blueLight1 = new THREE.PointLight(0x0088ff, 1.2, 25);
        blueLight1.position.set(-15, 3, 15);
        this.scene.add(blueLight1);

        const blueLight2 = new THREE.PointLight(0x0088ff, 1.2, 25);
        blueLight2.position.set(15, 3, -15);
        this.scene.add(blueLight2);

        // Yeşil accent ışıklar
        const greenLight1 = new THREE.PointLight(0x00ff00, 0.8, 20);
        greenLight1.position.set(0, 3, -20);
        this.scene.add(greenLight1);

        const greenLight2 = new THREE.PointLight(0x00ff00, 0.8, 20);
        greenLight2.position.set(0, 3, 20);
        this.scene.add(greenLight2);

        // Güçlü oyuncu el feneri
        this.flashlight = new THREE.SpotLight(0xffffee, 2.5, 40, Math.PI / 4, 0.3);
        this.flashlight.position.copy(this.camera.position);
        this.flashlight.target.position.set(0, 0, -1);
        this.scene.add(this.flashlight);
        this.scene.add(this.flashlight.target);
        
        // Ek halo efekti
        this.flashlightHalo = new THREE.PointLight(0xffffaa, 1, 10);
        this.camera.add(this.flashlightHalo);
        this.flashlightHalo.position.set(0, 0, -2);
    }

    _createLevel() {
        // Parlak zemin
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333344,
            roughness: 0.7,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Parlak tavan
        const ceiling = floor.clone();
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 5;
        ceiling.material = new THREE.MeshStandardMaterial({ 
            color: 0x222233,
            roughness: 0.8
        });
        this.scene.add(ceiling);

        // Daha parlak duvarlar
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x555566,
            roughness: 0.8,
            metalness: 0.1
        });

        const wallPositions = [
            // Outer walls
            { x: 0, z: -25, w: 50, h: 5, d: 1 },
            { x: 0, z: 25, w: 50, h: 5, d: 1 },
            { x: -25, z: 0, w: 1, h: 5, d: 50 },
            { x: 25, z: 0, w: 1, h: 5, d: 50 },

            // Inner maze walls
            { x: -10, z: -10, w: 1, h: 5, d: 15 },
            { x: 10, z: 10, w: 1, h: 5, d: 15 },
            { x: 0, z: -15, w: 20, h: 5, d: 1 },
            { x: 15, z: 0, w: 1, h: 5, d: 20 },
            { x: -15, z: 5, w: 15, h: 5, d: 1 },
        ];

        wallPositions.forEach(pos => {
            const geometry = new THREE.BoxGeometry(pos.w, pos.h, pos.d);
            const wall = new THREE.Mesh(geometry, wallMaterial);
            wall.position.set(pos.x, pos.h / 2, pos.z);
            wall.userData.isWall = true;
            this.scene.add(wall);
            this.walls.push(wall);
        });

        // Add some decorative pillars with lights
        for (let i = 0; i < 8; i++) {
            const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
            const pillarMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x880000,
                emissive: 0x440000,
                emissiveIntensity: 0.5,
                roughness: 0.6
            });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                (Math.random() - 0.5) * 40,
                2.5,
                (Math.random() - 0.5) * 40
            );
            this.scene.add(pillar);
            
            // Her sütuna ışık ekle
            const pillarLight = new THREE.PointLight(0xff0000, 0.8, 15);
            pillarLight.position.copy(pillar.position);
            pillarLight.position.y = 4;
            this.scene.add(pillarLight);
        }
    }

    _createPlayer() {
        // Weapon model (simple gun)
        const weaponGroup = new THREE.Group();
        
        // Gun body
        const gunBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        weaponGroup.add(gunBody);
        
        // Gun barrel
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
            new THREE.MeshStandardMaterial({ color: 0x111111 })
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = -0.35;
        weaponGroup.add(barrel);

        
        // Position weapon in front of camera
        weaponGroup.position.set(0.3, -0.3, -0.5);
        this.camera.add(weaponGroup);
        this.scene.add(this.camera);
        this.weapon = weaponGroup;
        this.weaponBobTime = 0;
    }

    _spawnInitialEnemies() {
        for (let i = 0; i < 3; i++) {
            this._spawnEnemy();
        }
    }

    _spawnEnemy() {
        // Create demon-like enemy
        const enemyGroup = new THREE.Group();
        
        // Body (red cube with horns)
        const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0x440000,
            emissiveIntensity: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        enemyGroup.add(body);
        
        // Horns
        const hornGeometry = new THREE.ConeGeometry(0.2, 0.5, 6);
        const hornMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x880000 
        });
        
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(-0.4, 2.3, 0);
        leftHorn.rotation.z = -0.3;
        enemyGroup.add(leftHorn);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(0.4, 2.3, 0);
        rightHorn.rotation.z = 0.3;
        enemyGroup.add(rightHorn);
        
        // Eyes (glowing)
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 1.5, 0.5);
        enemyGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 1.5, 0.5);
        enemyGroup.add(rightEye);

        
        // Random spawn position (not too close to player)
        let spawnPos;
        do {
            spawnPos = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                0,
                (Math.random() - 0.5) * 40
            );
        } while (spawnPos.distanceTo(this.camera.position) < 10);
        
        enemyGroup.position.copy(spawnPos);
        enemyGroup.userData.health = 100;
        enemyGroup.userData.speed = 2 + this.wave * 0.2;
        enemyGroup.userData.damage = 10;
        enemyGroup.userData.attackCooldown = 0;
        enemyGroup.userData.isEnemy = true;
        
        this.scene.add(enemyGroup);
        this.enemies.push(enemyGroup);
    }

    _bindControls() {
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            switch(e.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'Space': 
                case 'KeyE': this.moveUp = true; break;      // Yukarı çık
                case 'ShiftLeft':
                case 'KeyQ': this.moveDown = true; break;    // Aşağı in
                case 'KeyR': this._reload(); break;
                case 'KeyF': this._toggleFlashlight(); break; // El feneri aç/kapa
            }
        };

        this._keyUpHandler = (e) => {
            switch(e.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'Space':
                case 'KeyE': this.moveUp = false; break;
                case 'ShiftLeft':
                case 'KeyQ': this.moveDown = false; break;
            }
        };

        this._clickHandler = () => {
            if (this.isPointerLocked && !this.gameOver) {
                this._shoot();
            }
        };

        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);
        this.canvas.addEventListener('click', this._clickHandler);
    }

    _setupPointerLock() {
        this._pointerLockChange = () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
        };


        this._mouseHandler = (e) => {
            if (!this.isPointerLocked) return;
            
            const sensitivity = 0.002;
            
            // Sadece Y ekseni rotasyonu (yatay döndürme)
            this.camera.rotation.y -= e.movementX * sensitivity;
            
            // X ekseni rotasyonu (yukarı/aşağı bakma) - sınırlı
            this.camera.rotation.x -= e.movementY * sensitivity;
            this.camera.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.camera.rotation.x));
            
            // Z rotasyonunu tamamen sıfırla (yatma yok!)
            this.camera.rotation.z = 0;
            
            // Rotation order'ı zorla
            this.camera.rotation.order = 'YXZ';
        };

        document.addEventListener('pointerlockchange', this._pointerLockChange);
        document.addEventListener('mousemove', this._mouseHandler);
        
        // Request pointer lock on canvas click
        this.canvas.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                this.canvas.requestPointerLock();
            }
        });
    }

    _shoot() {
        if (this.player.ammo <= 0) {
            if (window.soundManager) window.soundManager.playBuzz();
            return;
        }

        this.player.ammo--;
        
        // Weapon recoil animation
        if (this.weapon) {
            this.weapon.position.z = -0.6;
            setTimeout(() => {
                if (this.weapon) this.weapon.position.z = -0.5;
            }, 100);
        }

        // Raycast from camera center
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(this.camera.rotation);
        
        this.raycaster.set(this.camera.position, direction);
        
        // Get all intersectable objects (enemies and their children)
        const intersectableObjects = [];
        this.enemies.forEach(enemy => {
            intersectableObjects.push(enemy);
            enemy.traverse(child => {
                if (child.isMesh) {
                    intersectableObjects.push(child);
                }
            });
        });
        
        const intersects = this.raycaster.intersectObjects(intersectableObjects, false);

        let hitEnemy = false;
        if (intersects.length > 0) {
            const intersect = intersects[0];
            let targetEnemy = intersect.object;
            
            // Find the parent enemy group
            while (targetEnemy.parent && !targetEnemy.userData.isEnemy) {
                targetEnemy = targetEnemy.parent;
            }
            
            if (targetEnemy.userData.isEnemy) {
                targetEnemy.userData.health -= 25;
                
                // Blood effect at hit point
                this._createBloodSplatter(intersect.point);
                
                // Flash enemy red when hit
                targetEnemy.traverse(child => {
                    if (child.isMesh && child.material) {
                        const originalEmissive = child.material.emissive.clone();
                        child.material.emissive.setHex(0xff0000);
                        setTimeout(() => {
                            if (child.material) {
                                child.material.emissive.copy(originalEmissive);
                            }
                        }, 150);
                    }
                });
                
                if (targetEnemy.userData.health <= 0) {
                    this._killEnemy(targetEnemy);
                } else {
                    // Set hit indicator
                    this.lastHitTime = Date.now();
                }
                hitEnemy = true;
            }
        }

        if (window.soundManager) {
            window.soundManager.playShoot();
        }
        
        console.log(`Shot fired! Hit: ${hitEnemy}, Intersects: ${intersects.length}`);
    }


    _createBloodSplatter(position) {
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 4, 4);
            const material = new THREE.MeshBasicMaterial({ color: 0x880000 });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.copy(position);
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 3,
                (Math.random() - 0.5) * 5
            );
            particle.userData.life = 0.5;
            
            this.scene.add(particle);
            this.bullets.push(particle);
        }
    }

    _killEnemy(enemy) {
        this.score += 100;
        this.kills++;
        
        // Remove enemy
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        this.scene.remove(enemy);
        
        // Spawn pickup
        this._spawnPickup(enemy.position);
        
        if (window.soundManager) window.soundManager.playExplosion();
        
        // Check wave completion
        if (this.enemies.length === 0) {
            this.wave++;
            setTimeout(() => {
                const enemyCount = 3 + this.wave;
                for (let i = 0; i < enemyCount; i++) {
                    this._spawnEnemy();
                }
            }, 2000);
        }
    }

    _spawnPickup(position) {
        const pickupType = Math.random() < 0.5 ? 'health' : 'ammo';
        
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshStandardMaterial({ 
            color: pickupType === 'health' ? 0x00ff00 : 0xffff00,
            emissive: pickupType === 'health' ? 0x00ff00 : 0xffff00,
            emissiveIntensity: 0.5
        });
        const pickup = new THREE.Mesh(geometry, material);
        pickup.position.copy(position);
        pickup.position.y = 0.5;
        pickup.userData.type = pickupType;
        pickup.userData.rotationSpeed = 2;
        
        this.scene.add(pickup);
        this.pickups.push(pickup);
    }


    _jump() {
        // Simple jump (not implemented in this version)
    }

    _reload() {
        if (this.player.ammo < 50) {
            this.player.ammo = Math.min(50, this.player.ammo + 10);
            if (window.soundManager) window.soundManager.playPowerUp();
        }
    }

    _toggleFlashlight() {
        this.flashlightOn = !this.flashlightOn;
        if (this.flashlight) {
            this.flashlight.intensity = this.flashlightOn ? 2.5 : 0;
        }
        if (this.flashlightHalo) {
            this.flashlightHalo.intensity = this.flashlightOn ? 1 : 0;
        }
        if (window.soundManager) window.soundManager.playClick();
    }

    update(dt) {
        if (this.gameOver || !this.renderer) return;

        // Player movement with vertical controls
        const moveSpeed = 5;
        const verticalSpeed = 3;
        this.velocity.set(0, 0, 0);

        if (this.moveForward) this.velocity.z -= moveSpeed * dt;
        if (this.moveBackward) this.velocity.z += moveSpeed * dt;
        if (this.moveLeft) this.velocity.x -= moveSpeed * dt;
        if (this.moveRight) this.velocity.x += moveSpeed * dt;
        if (this.moveUp) this.velocity.y += verticalSpeed * dt;      // Yukarı çık
        if (this.moveDown) this.velocity.y -= verticalSpeed * dt;    // Aşağı in

        // Apply rotation to horizontal velocity only
        const horizontalVelocity = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
        const euler = new THREE.Euler(0, this.camera.rotation.y, 0);
        horizontalVelocity.applyEuler(euler);
        
        // Combine horizontal and vertical movement
        const finalVelocity = new THREE.Vector3(
            horizontalVelocity.x,
            this.velocity.y,
            horizontalVelocity.z
        );

        // Collision detection with walls
        const newPos = this.camera.position.clone().add(finalVelocity);
        let canMove = true;

        // Vertical bounds (don't go below floor or above ceiling)
        if (newPos.y < 0.5) {
            newPos.y = 0.5;
            finalVelocity.y = 0;
        }
        if (newPos.y > 4.5) {
            newPos.y = 4.5;
            finalVelocity.y = 0;
        }

        for (let wall of this.walls) {
            const wallBox = new THREE.Box3().setFromObject(wall);
            const playerBox = new THREE.Box3().setFromCenterAndSize(
                newPos,
                new THREE.Vector3(0.5, 0.3, 0.5) // Smaller collision box
            );
            
            if (wallBox.intersectsBox(playerBox)) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            this.camera.position.add(finalVelocity);
        }

        // Weapon bobbing - more dynamic
        if (this.weapon && (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight)) {
            this.weaponBobTime += dt * 12;
            this.weapon.position.y = -0.3 + Math.sin(this.weaponBobTime) * 0.03;
            this.weapon.position.x = 0.3 + Math.sin(this.weaponBobTime * 0.7) * 0.01;
        }

        // Enhanced flashlight system
        if (this.flashlight && this.flashlightOn) {
            this.flashlight.position.copy(this.camera.position);
            
            // Calculate flashlight direction based on camera rotation
            const direction = new THREE.Vector3(0, 0, -1);
            direction.applyEuler(new THREE.Euler(
                this.camera.rotation.x,
                this.camera.rotation.y,
                0
            ));
            
            this.flashlight.target.position.copy(this.camera.position).add(direction.multiplyScalar(10));
            
            // Flashlight flickering effect
            const flicker = 1 + Math.sin(Date.now() * 0.02) * 0.1;
            this.flashlight.intensity = 2.5 * flicker;
        }


        // Update enemies - chase player
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Look at player
            enemy.lookAt(this.camera.position);
            
            // Move towards player
            const direction = new THREE.Vector3();
            direction.subVectors(this.camera.position, enemy.position);
            direction.y = 0;
            direction.normalize();
            
            const moveDistance = enemy.userData.speed * dt;
            const newEnemyPos = enemy.position.clone().add(direction.multiplyScalar(moveDistance));
            
            // Check wall collision for enemy
            let enemyCanMove = true;
            for (let wall of this.walls) {
                const wallBox = new THREE.Box3().setFromObject(wall);
                const enemyBox = new THREE.Box3().setFromCenterAndSize(
                    newEnemyPos,
                    new THREE.Vector3(1, 2, 1)
                );
                
                if (wallBox.intersectsBox(enemyBox)) {
                    enemyCanMove = false;
                    break;
                }
            }
            
            if (enemyCanMove) {
                enemy.position.copy(newEnemyPos);
            }
            
            // Attack player if close
            const distToPlayer = enemy.position.distanceTo(this.camera.position);
            if (distToPlayer < 2) {
                enemy.userData.attackCooldown -= dt;
                if (enemy.userData.attackCooldown <= 0) {
                    this.player.health -= enemy.userData.damage;
                    enemy.userData.attackCooldown = 1;
                    
                    if (window.soundManager) window.soundManager.playDeath();
                    
                    if (this.player.health <= 0) {
                        this._triggerGameOver();
                        return;
                    }
                }
            }
            
            // Animate enemy (bob up and down)
            enemy.position.y = Math.sin(Date.now() * 0.003 + i) * 0.1;
        }

        // Update pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pickup = this.pickups[i];
            pickup.rotation.y += dt * pickup.userData.rotationSpeed;
            pickup.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.1;
            
            // Check if player collects pickup
            const distToPlayer = pickup.position.distanceTo(this.camera.position);
            if (distToPlayer < 1.5) {
                if (pickup.userData.type === 'health') {
                    this.player.health = Math.min(100, this.player.health + 25);
                } else {
                    this.player.ammo = Math.min(50, this.player.ammo + 10);
                }
                
                this.scene.remove(pickup);
                this.pickups.splice(i, 1);
                
                if (window.soundManager) window.soundManager.playPowerUp();
            }
        }


        // Update blood particles
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const particle = this.bullets[i];
            particle.userData.life -= dt;
            
            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                this.bullets.splice(i, 1);
            } else {
                particle.position.add(particle.userData.velocity.clone().multiplyScalar(dt));
                particle.userData.velocity.y -= 9.8 * dt; // Gravity
            }
        }

        // Spawn more enemies over time
        this.enemySpawnTimer += dt;
        if (this.enemySpawnTimer >= this.enemySpawnRate && this.enemies.length < 10) {
            this.enemySpawnTimer = 0;
            this._spawnEnemy();
        }
    }

    draw() {
        if (!this.renderer || !this.scene || !this.camera) return;
        
        this.renderer.render(this.scene, this.camera);
        
        // Draw HUD
        if (!this.uiCanvas) {
            this.uiCanvas = document.createElement('canvas');
            this.uiCanvas.width = this.canvas.width;
            this.uiCanvas.height = this.canvas.height;
            this.uiCanvas.style.position = 'absolute';
            this.uiCanvas.style.top = '0';
            this.uiCanvas.style.left = '0';
            this.uiCanvas.style.pointerEvents = 'none';
            this.uiCanvas.style.width = '100%';
            this.uiCanvas.style.height = '100%';
            this.canvas.parentElement.appendChild(this.uiCanvas);
            this.uiCtx = this.uiCanvas.getContext('2d');
        }
        
        this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
        
        // Health bar
        this.uiCtx.fillStyle = '#ff0000';
        this.uiCtx.fillRect(20, this.uiCanvas.height - 60, 200, 20);
        this.uiCtx.fillStyle = '#00ff00';
        this.uiCtx.fillRect(20, this.uiCanvas.height - 60, 200 * (this.player.health / 100), 20);
        
        this.uiCtx.fillStyle = '#ffffff';
        this.uiCtx.font = 'bold 16px Inter';
        this.uiCtx.fillText(`HP: ${Math.max(0, Math.floor(this.player.health))}`, 25, this.uiCanvas.height - 45);
        
        // Ammo
        this.uiCtx.fillStyle = '#ffff00';
        this.uiCtx.font = 'bold 20px Inter';
        this.uiCtx.fillText(`AMMO: ${this.player.ammo}`, 20, this.uiCanvas.height - 80);
        
        // Score and wave
        this.uiCtx.fillStyle = '#00ddff';
        this.uiCtx.font = 'bold 24px Inter';
        this.uiCtx.fillText(`SCORE: ${this.score}`, 20, 40);
        this.uiCtx.fillText(`WAVE: ${this.wave}`, 20, 70);
        
        // Enhanced crosshair with hit indicator
        const timeSinceHit = Date.now() - this.lastHitTime;
        const isRecentHit = timeSinceHit < 200;
        
        this.uiCtx.strokeStyle = isRecentHit ? '#ff0000' : '#00ff00';
        this.uiCtx.lineWidth = isRecentHit ? 4 : 3;
        const centerX = this.uiCanvas.width / 2;
        const centerY = this.uiCanvas.height / 2;
        const crosshairSize = isRecentHit ? 20 : 15;
        
        this.uiCtx.beginPath();
        // Horizontal line
        this.uiCtx.moveTo(centerX - crosshairSize, centerY);
        this.uiCtx.lineTo(centerX + crosshairSize, centerY);
        // Vertical line
        this.uiCtx.moveTo(centerX, centerY - crosshairSize);
        this.uiCtx.lineTo(centerX, centerY + crosshairSize);
        // Center dot
        this.uiCtx.moveTo(centerX - 2, centerY);
        this.uiCtx.lineTo(centerX + 2, centerY);
        this.uiCtx.moveTo(centerX, centerY - 2);
        this.uiCtx.lineTo(centerX, centerY + 2);
        this.uiCtx.stroke();
        
        // Enemy count indicator
        this.uiCtx.fillStyle = '#ff0000';
        this.uiCtx.font = 'bold 18px Inter';
        this.uiCtx.fillText(`ENEMIES: ${this.enemies.length}`, 20, 100);
        
        // Controls hint
        if (!this.isPointerLocked) {
            this.uiCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.uiCtx.fillRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
            this.uiCtx.fillStyle = '#ffffff';
            this.uiCtx.font = 'bold 32px Inter';
            this.uiCtx.textAlign = 'center';
            this.uiCtx.fillText('🔫 DOOM 3D 💀', centerX, centerY - 60);
            this.uiCtx.fillStyle = '#00ff00';
            this.uiCtx.font = 'bold 24px Inter';
            this.uiCtx.fillText('CLICK TO ENTER HELL', centerX, centerY);
            
            this.uiCtx.fillStyle = '#ffff00';
            this.uiCtx.font = '16px Inter';
            this.uiCtx.fillText('WASD: Move | E/Q: Up/Down | Mouse: Look', centerX, centerY + 40);
            this.uiCtx.fillText('Click: Shoot | R: Reload | F: Flashlight', centerX, centerY + 60);
            this.uiCtx.textAlign = 'left';
        }
        
        // Flashlight indicator
        if (this.isPointerLocked) {
            this.uiCtx.fillStyle = this.flashlightOn ? '#ffff00' : '#666666';
            this.uiCtx.font = 'bold 16px Inter';
            this.uiCtx.fillText(`💡 ${this.flashlightOn ? 'ON' : 'OFF'}`, this.uiCanvas.width - 80, 30);
        }
    }


    _triggerGameOver() {
        this.gameOver = true;
        
        if (window.gameManager) {
            window.gameManager.checkAndUpdateHighScore('doom3d', this.score);
        }
        
        document.exitPointerLock();
        
        setTimeout(() => this._showGameOverOverlay(), 500);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager ? window.gameManager.getHighScore('doom3d') : 0;
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">💀 YOU DIED 💀</div>
            <div class="game-over-score">Score: ${this.score}</div>
            <div class="game-over-score">Wave: ${this.wave}</div>
            <div class="game-over-score">Kills: ${this.kills}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="doom3d-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        
        overlay.querySelector('#doom3d-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    getScore() {
        return this.score;
    }

    isGameOver() {
        return this.gameOver;
    }

    destroy() {
        // Remove event listeners
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);
        if (this._clickHandler) this.canvas.removeEventListener('click', this._clickHandler);
        if (this._mouseHandler) document.removeEventListener('mousemove', this._mouseHandler);
        if (this._pointerLockChange) document.removeEventListener('pointerlockchange', this._pointerLockChange);
        
        document.exitPointerLock();
        
        // Remove UI canvas
        if (this.uiCanvas && this.uiCanvas.parentElement) {
            this.uiCanvas.parentElement.removeChild(this.uiCanvas);
        }
        
        // Remove WebGL canvas
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
        
        // Show original canvas
        if (this.originalCanvas) {
            this.originalCanvas.style.display = 'block';
        }
        
        // Clean up Three.js
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            while(this.scene.children.length > 0) { 
                const object = this.scene.children[0];
                if (object.geometry) object.geometry.dispose();
                if (object.material) object.material.dispose();
                this.scene.remove(object);
            }
        }
        
        console.log('✅ DOOM 3D cleaned up');
    }
}

// Register game
if (window.gameManager) {
    window.gameManager.registerGame('doom3d', Doom3D, {
        name: 'DOOM 3D',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
