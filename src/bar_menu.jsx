import React, { useState } from 'react';

const BAR_MENU = ({ onCategorySelect }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMouseEnter = (menu) => {
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  const handleClick = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleSubcategoryClick = (category, subcategory) => {
    onCategorySelect(category, subcategory);
  };

  return (
    <nav style={styles.navbar}>
      <a href="#" style={styles.logo}>My Brand</a>
      <ul style={styles.menuList}>
        <li
          style={styles.menuItem}
          onMouseEnter={() => handleMouseEnter('SPORT')}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick('SPORT')}
        >
          <a href="#" style={styles.menuLink}>SPORT</a>
          {activeMenu === 'SPORT' && (
            <ul style={styles.subMenu}>
              <li style={styles.subMenuItem}><a href="#" onClick={() => handleSubcategoryClick('SPORT', 'Football')}>Football</a></li>
              <li style={styles.subMenuItem}><a href="#" onClick={() => handleSubcategoryClick('SPORT', 'Soccer')}>Soccer</a></li>
              <li style={styles.subMenuItem}><a href="#" onClick={() => handleSubcategoryClick('SPORT', 'Basketball')}>Basketball</a></li>
              <li style={styles.subMenuItem}><a href="#" onClick={() => handleSubcategoryClick('SPORT', 'NFL')}>NFL</a></li>
              <li style={styles.subMenuItem}><a href="#" onClick={() => handleSubcategoryClick('SPORT', 'Volleyball')}>Volleyball</a></li>
            </ul>
          )}
        </li>
        <li style={styles.menuItem}><a href="#" style={styles.menuLink}>FILM</a></li>
        <li style={styles.menuItem}><a href="#" style={styles.menuLink}>MUSIC</a></li>
        <li style={styles.menuItem}><a href="#" style={styles.menuLink}>LIFESTYLE</a></li>
        <li style={styles.menuItem}><a href="#" style={styles.menuLink}>CRYPTO</a></li>
        <li style={styles.menuItem}><a href="#" style={styles.menuLink}>BRANDS</a></li>
      </ul>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: '60px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  logo: {
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  menuList: {
    listStyleType: 'none',
    display: 'flex',
    gap: '20px',
    margin: 0,
    padding: 0,
  },
  menuItem: {
    position: 'relative',
    cursor: 'pointer',
  },
  menuLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '0 10px',
    position: 'relative',
    transition: 'color 0.3s',
  },
  subMenu: {
    listStyleType: 'none',
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#333',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
  },
  subMenuItem: {
    margin: '5px 0',
  },
};

export default BAR_MENU;
