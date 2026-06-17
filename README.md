| 서비스 | URL | 계정 |
|--------|-----|------|
| 중고마켓 | http://192.168.56.10 | 회원가입 후 이용 |
| Grafana | http://192.168.56.10:3000 | admin / admin123 |
| ArgoCD | https://192.168.56.21:31726 | admin / (시크릿 참조) |

## 인프라 구성
| VM | IP | 역할 |
|----|-----|------|
| lb-01 | 192.168.56.10 | HAProxy 로드밸런서 |
| cp-01 | 192.168.56.11 | K8s Control Plane |
| worker-01 | 192.168.56.21 | K8s Worker |
| worker-02 | 192.168.56.22 | K8s Worker |
| worker-03 | 192.168.56.23 | K8s Worker |

## 기술 스택
| 영역 | 기술 |
|------|------|
| 컨테이너 오케스트레이션 | Kubernetes v1.31 (kubeadm) |
| CNI | Flannel |
| 스토리지 | Longhorn (replica 3) |
| 오브젝트 스토리지 | MinIO |
| 백업 | Velero (6시간마다 자동) |
| 데이터베이스 | PostgreSQL + Redis |
| 보안 | Kyverno + RBAC + NetworkPolicy |
| GitOps | ArgoCD |
| CI/CD | GitHub Actions |
| 이미지 레지스트리 | ghcr.io |
| 모니터링 | Prometheus + Grafana |
| 로드밸런서 | HAProxy |
| 백엔드 | FastAPI (Python 3.11) |
| 프론트엔드 | React + TypeScript + Tailwind CSS |
## CI/CD 파이프라인
## 백업 전략
- Velero: 6시간마다 전체 백업 → MinIO 저장
- etcd: 6시간마다 스냅샷 (cron)
- Git: 모든 K8s 매니페스트 버전 관리

## 주요 명령어
```bash
# 클러스터 상태
kubectl get nodes
kubectl get pods -A

# 백업 확인
velero backup get

# 모니터링
# http://192.168.56.10:3000

# 수동 백업
velero backup create manual-backup --include-namespaces backend,frontend,data
```
