# belajar-k8s — materi belajar orkestrasi Kubernetes

Cluster: k3s single-node di VM DevOps (`192.168.0.100`).
Monitoring: CT `192.168.0.102` (Prometheus + Grafana).
Database: CT `192.168.0.103` (Postgres + Redis).

## Struktur

```
apps/
  sample-web/         # Latihan 1-2: Namespace + Deployment + Service + Ingress (nginx)
  uptime-kuma/        # Latihan 3: aplikasi real + PVC (status monitoring)
  company/            # Latihan 4: company profile, konten via ConfigMap
  monitoring-agents/  # Latihan 5: node-exporter DaemonSet + kube-state-metrics + RBAC + NodePort
  apidb/              # Latihan 6: API + Secret, database di luar cluster
apidb/                # source code API mini (Node.js)
company/index.html    # source konten company profile (jadikan ConfigMap ulang jika diubah)
monitoring/           # config Prometheus & systemd unit di CT monitoring
```

## Catatan keamanan

File `apps/apidb/apidb.yaml` memakai password **placeholder** (`CHANGEME-*`).
Password asli hanya hidup di cluster sebagai Secret live dan TIDAK di-commit.
ArgoCD Application untuk `apidb` memakai `ignoreDifferences` pada Secret agar tidak tertimpa.
Lihat materi sealed-secrets untuk solusi produksi.
