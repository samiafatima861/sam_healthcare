import styles from '../../../assets/styles/StaffDashboards.module.css';

const ROOMS = [
  { name: 'OT 1', status: 'In use', note: 'Appendectomy at 5:00 PM' },
  { name: 'OT 2', status: 'In use', note: 'Knee arthroscopy in progress' },
  { name: 'OT 3', status: 'Available', note: 'Free until further notice' },
];

const ROOM_PILL = { Available: styles.pillGreen, 'In use': styles.pillWarn, Cleaning: styles.pillGray };

export default function OtRooms() {
  const available = ROOMS.filter((r) => r.status === 'Available').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Room status</h1>
          <p className={styles.subtitle}>{available} of {ROOMS.length} rooms available.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.roomGrid}>
          {ROOMS.map((r) => (
            <div key={r.name} className={styles.roomCard}>
              <p className={styles.roomName}>{r.name}</p>
              <span className={`${styles.pill} ${ROOM_PILL[r.status]}`} style={{ marginTop: 6, display: 'inline-block' }}>
                {r.status}
              </span>
              <p className={styles.roomMeta}>{r.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}