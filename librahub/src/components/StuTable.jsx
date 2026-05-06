const [dailyFine, setDailyFine] = useState(30);

const fetchSettings = async () => {
  const docSnap = await getDocs(collection(db, "settings"));
  if (!docSnap.empty) {
    const config = docSnap.docs.find(d => d.id === "libraryConfig");
    if (config) {
      setBorrowDuration(config.data().borrowDuration);
      setDailyFine(config.data().dailyFine || 30);
    }
  }
};

const calculateFine = (borrowedAt) => {
  if (!borrowedAt) return { dueDate: "N/A", fine: 0 };

  const borrowDate = borrowedAt.toDate();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(borrowDate.getDate() + Number(borrowDuration));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  if (today > dueDate) {
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      dueDate: dueDate.toLocaleDateString(),
      fine: diffDays * Number(dailyFine),
    };
  }

  return { dueDate: dueDate.toLocaleDateString(), fine: 0 };
};