from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime, timedelta 

# FINAL SCRIPT - TYPO FIXED
def parse_promo_date(date_text):
    """
    Parses two possible date formats:
    1. 'Periode Promo: Aug 6, 2025 - Sep 8, 2025'
    2. 'Periode Promo: Hingga Agustus 2025'
    """
    try:
        cleaned_text = date_text.replace("Periode Promo:", "").strip()
        
        if ' - ' in cleaned_text:
            start_str, end_str = cleaned_text.split(' - ')
            
            end_date_obj = datetime.strptime(end_str.replace(",", ""), "%b %d %Y")
            
            if len(start_str.split()) == 1:
                start_date_obj = end_date_obj.replace(day=int(start_str))
            else:
                start_date_obj = datetime.strptime(start_str.replace(",", ""), "%b %d %Y")

            return start_date_obj.strftime("%Y-%m-%d"), end_date_obj.strftime("%Y-%m-%d")
        
        elif 'Hingga' in cleaned_text:
            today = datetime.now()
            start_date_str = today.strftime("%Y-%m-%d")

            month_map = {
                'januari': 'Jan', 'februari': 'Feb', 'maret': 'Mar', 'april': 'Apr', 'mei': 'May', 'juni': 'Jun',
                'juli': 'Jul', 'agustus': 'Aug', 'september': 'Sep', 'oktober': 'Oct', 'november': 'Nov', 'desember': 'Dec'
            }
            end_str = cleaned_text.replace("Hingga ", "").replace("Berlaku Setiap Hari", "").strip()
            month_id, year_str = end_str.split()
            month_en = month_map.get(month_id.lower())
            
            end_date = datetime.strptime(f"{month_en} {year_str}", "%b %Y")
            next_month = end_date.replace(day=28) + timedelta(days=4)
            last_day_of_month = next_month - timedelta(days=next_month.day)
            
            return start_date_str, last_day_of_month.strftime("%Y-%m-%d")

        else:
            return "", ""

    except Exception as e:
        print(f"  > Could not parse date: '{date_text}'. Error: {e}")
        return "", ""

def scrape_hartono():
    """Scrapes promotion data from Hartono's website using Selenium."""
    
    print("Setting up Selenium Chrome driver...")
    service = Service(executable_path='chromedriver.exe')
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("start-maximized")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/5.37.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36")
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    url = "https://myhartono.com/en/promo-pilihan"
    print(f"Navigating to CORRECT URL: {url}...")
    
    try:
        driver.get(url)
        print("Waiting for page to load...")
        time.sleep(10)
        html_content = driver.page_source
    except Exception as e:
        print(f"An error occurred during browser navigation: {e}")
        driver.quit()
        return []
    
    print("Browser loaded page. Now closing browser and parsing HTML...")
    driver.quit()

    soup = BeautifulSoup(html_content, 'html.parser')
    
    promo_cards = soup.find_all('div', class_='ty-column3')

    if not promo_cards:
        print("No promotion cards found.")
        return []

    print(f"SUCCESS! Found {len(promo_cards)} promotions.")
    
    promotions = []
    for card in promo_cards:
        try:
            title_element = card.find('strong')
            if not title_element: continue

            date_element = card.find('p')
            link_element = card.find_all('a')[-1]

            title = title_element.get_text(strip=True)
            date_range_text = date_element.get_text(strip=True) if date_element else ""
            promo_url = link_element['href'] if link_element and 'href' in link_element.attrs else "#"
            
            start_date, end_date = parse_promo_date(date_range_text)
            
            promo_data = {
                "competitor": "Hartono",
                "title": title,
                "startDate": start_date,
                "endDate": end_date,
                "details": date_range_text,
                "url": promo_url
            }
            promotions.append(promo_data)
        except Exception as e:
            continue
            
    return promotions

# --- Main Execution ---
if __name__ == "__main__":
    all_promotions = []
    hartono_promos = scrape_hartono()
    all_promotions.extend(hartono_promos)

    output_file = 'promotions.json'
    with open(output_file, 'w') as f:
        # TYPO FIXED HERE
        json.dump(all_promotions, f, indent=4)
        
    print(f"\nScraping complete. Data saved to {output_file}")
    print(f"Total promotions successfully parsed: {len(all_promotions)}")