export type DepartmentHeadCount = {
  department: string;
  count: number;
};

export type HeadCountByMonth = {
  label: string;
  value: DepartmentHeadCount[];
};

export type HeadCountResponse = {
  headcountByDepartment: HeadCountByMonth[];
};

// Helper function to transform data for chart display
export const transformHeadCountDataForChart = (
  headCountData: HeadCountResponse | undefined, 
  selectedDepartment: string = 'all'
) => {
  if (!headCountData?.headcountByDepartment?.length) {
    return { labels: [], datasets: [] };
  }

  // Extract all time period labels
  const labels = headCountData.headcountByDepartment.map(item => item.label);
  
  // Get unique departments
  const uniqueDepartments = new Set<string>();
  headCountData.headcountByDepartment.forEach(monthData => {
    monthData.value.forEach(deptData => {
      uniqueDepartments.add(deptData.department);
    });
  });
  
  // Generate colors for departments
  const colors = [
    '#4CAF50', // green
    '#2196F3', // blue
    '#FFC107', // amber
    '#9C27B0', // purple
    '#F44336', // red
    '#00BCD4', // cyan
    '#FF9800', // orange
    '#795548', // brown
    '#607D8B', // blue-grey
    '#3F51B5', // indigo
  ];
  
  // Create a dataset for each department
  const datasets = Array.from(uniqueDepartments).map((dept, index) => {
    // Filter by selected department if not 'all'
    if (selectedDepartment !== 'all' && dept !== selectedDepartment) {
      return null;
    }
    
    // For each department, collect headcount across all time periods
    const data = headCountData.headcountByDepartment.map(monthData => {
      const deptData = monthData.value.find(d => d.department === dept);
      return deptData ? deptData.count : 0;
    });
    
    const colorIndex = index % colors.length;
    
    return {
      label: dept,
      data,
      borderColor: colors[colorIndex],
      backgroundColor: `${colors[colorIndex]}33`,
      tension: 0.3,
      fill: false,
    };
  }).filter(Boolean); // Remove null items
  
  return { labels, datasets };
};
