// Mocks de respuestas para el simulador
        const mockResponses = {
            'SCR-001': `Building configuration...\n\nCurrent configuration : 1532 bytes\n!\nhostname {DEVICE}\n!\nno aaa new-model\nclock timezone UTC 0\n!\ninterface GigabitEthernet0/0\n description LINK_TO_CORE\n ip address 10.0.X.X 255.255.255.0\n duplex auto\n speed auto\n!\nline vty 0 4\n transport input ssh\n!\nend`,
            'SCR-002': `Interface                  IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0         10.0.1.1        YES NVRAM  up                    up      \nGigabitEthernet0/1         10.0.1.2        YES NVRAM  up                    up      \nVlan1                      unassigned      YES NVRAM  administratively down down`,
            'SCR-003': `Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP\n\nGateway of last resort is 10.0.0.1 to network 0.0.0.0\n\nS*    0.0.0.0/0 [1/0] via 10.0.0.1\n      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks\nC        10.0.1.0/24 is directly connected, GigabitEthernet0/0`,
            'SCR-004': `Protocol  Address          Age (min)  Hardware Addr   Type   Interface\nInternet  10.0.1.1                -   0000.5E00.0101  ARPA   GigabitEthernet0/0\nInternet  10.0.1.254              5   0000.5E00.0199  ARPA   GigabitEthernet0/0`,
            'SCR-005': `NetOS Software, Version 15.2(4)E6, RELEASE SOFTWARE (fc4)\nCompiled Thu 21-Sep-26 14:32 by prod_build\nROM: Bootstrap program is NetOS\n\n{DEVICE} uptime is 4 weeks, 2 days, 15 hours, 23 minutes`,
            'SCR-006': `Version: FortiOS v7.4.1 build 0246 (GA)\nVirus-DB: 1.00000\nIPS-DB: 1.00000\nSerial-Number: FG-LAB-00001\nLicense Status: Valid\nSystem time: Wed Sep  2 17:00:00 2026`,
            'SCR-007': `VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n1    default                          active    Gi1/0/1, Gi1/0/2\n10   MANAGEMENT                       active    Gi1/0/24\n20   DMZ_SERVERS                      active    Gi1/0/10, Gi1/0/11`,
            'SCR-008': `Standard IP access list 10\n    10 permit 10.0.0.0, wildcard bits 0.255.255.255 (154 matches)\nExtended IP access list RESTRICT_ADMIN\n    10 permit tcp host 10.0.1.50 any eq 22\n    20 deny tcp any any eq 22 (43 matches)`
        };

        function generateHash() {
            return Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
        }

        document.getElementById('simulatorForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const device = document.getElementById('device').value;
            const script = document.getElementById('script').value;
            const operator = document.getElementById('operator').value;
            
            const term = document.getElementById('terminal');
            const termContent = document.getElementById('terminal-content');
            
            term.style.display = 'block';
            
            // Simular delay de red
            termContent.replaceChildren();
            const intro = document.createElement('span');
            intro.style.color = '#f85149';
            intro.style.whiteSpace = 'pre-wrap';
            intro.textContent = '[EJECUCIÓN FICTICIA - LAB]' + String.fromCharCode(10) + 'Conectando a ' + device + ' (SSH)... OK' + String.fromCharCode(10) + 'Autenticando servicio... OK' + String.fromCharCode(10) + 'Ejecutando ' + script + '...' + String.fromCharCode(10, 10);
            termContent.appendChild(intro);
            
            setTimeout(() => {
                let output = mockResponses[script] || "Error: Script no reconocido.";
                output = output.replace(/{DEVICE}/g, device);
                
                const outputBlock = document.createElement('div');
                outputBlock.style.color = '#56d364';
                outputBlock.style.whiteSpace = 'pre-wrap';
                outputBlock.textContent = output + String.fromCharCode(10, 10) + 'Conexión cerrada.';
                termContent.appendChild(outputBlock);
                
                // Guardar en auditoría (localStorage)
                const auditEntry = {
                    id: Date.now(),
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z',
                    operator: operator,
                    device: device,
                    script: script,
                    status: 'SUCCESS',
                    hash: generateHash()
                };
                
                let auditLog = JSON.parse(localStorage.getItem('netops_audit_log') || '[]');
                auditLog.unshift(auditEntry); // Agregar al principio
                localStorage.setItem('netops_audit_log', JSON.stringify(auditLog));
                
                // Mostrar alerta de éxito
                const alertBox = document.getElementById('sim-alert');
                alertBox.className = 'alert alert-success';
                alertBox.replaceChildren();
                const successLabel = document.createElement('strong');
                successLabel.textContent = 'Éxito:';
                const hashValue = document.createElement('code');
                hashValue.textContent = String(auditEntry.hash);
                alertBox.append(successLabel, document.createTextNode(' La simulación se ha completado y registrado con el Hash: '), hashValue);
                
            }, 800);
        });
