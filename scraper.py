from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime, timedelta

# ==============================================================================
# FUNGSI PARSING TANGGAL
# ==============================================================================
def parse_promo_date(date_text):
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
            month_map = {'januari': 'Jan', 'februari': 'Feb', 'maret': 'Mar', 'april': 'Apr', 'mei': 'May', 'juni': 'Jun', 'juli': 'Jul', 'agustus': 'Aug', 'september': 'Sep', 'oktober': 'Oct', 'november': 'Nov', 'desember': 'Dec'}
            end_str = cleaned_text.replace("Hingga ", "").replace("Berlaku Setiap Hari", "").strip()
            month_id, year_str = end_str.split()
            month_en = month_map.get(month_id.lower())
            end_date = datetime.strptime(f"{month_en} {year_str}", "%b %Y")
            next_month = end_date.replace(day=28) + timedelta(days=4)
            last_day_of_month = next_month - timedelta(days=next_month.day)
            return start_date_str, last_day_of_month.strftime("%Y-%m-%d")
        else:
            return "", ""
    except Exception:
        return "", ""

# ==============================================================================
# SCRAPER HARTONO
# ==============================================================================
def scrape_hartono():
    print("\n--- Memulai Scrape Hartono ---")
    # --- MODIFIKASI: Biarkan Selenium menemukan chromedriver secara otomatis ---
    service = Service() 
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--log-level=3")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    url = "https://myhartono.com/en/promo-pilihan"
    print(f"Mengunjungi URL: {url}...")
    try:
        driver.get(url)
        time.sleep(10)
        html_content = driver.page_source
    except Exception as e:
        print(f"Error saat navigasi browser Hartono: {e}")
        driver.quit()
        return []
    driver.quit()
    soup = BeautifulSoup(html_content, 'html.parser')
    promo_cards = soup.find_all('div', class_='ty-column3')
    if not promo_cards: return []
    print(f"SUKSES! Menemukan {len(promo_cards)} promosi Hartono.")
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
            promo_data = {"competitor": "Hartono", "title": title, "startDate": start_date, "endDate": end_date, "details": date_range_text, "url": promo_url}
            promotions.append(promo_data)
        except Exception: continue
    return promotions

# ==============================================================================
# SCRAPER ELECTRONIC CITY
# ==============================================================================
def scrape_electronic_city():
    print("\n--- Memulai Scrape Electronic City ---")
    options = uc.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    # --- MODIFIKASI: Biarkan undetected_chromedriver menemukan driver-nya sendiri ---
    driver = uc.Chrome(options=options)
    
    url = "https://www.eci.id/promo"
    print(f"Mengunjungi URL: {url}...")
    
    promotions = []
    try:
        driver.get(url)
        print("Menunggu konten promosi dimuat...")
        wait = WebDriverWait(driver, 30)
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "card-promo")))
        print("Konten promosi ditemukan!")
        time.sleep(3)
        html_content = driver.page_source
        
        soup = BeautifulSoup(html_content, 'html.parser')
        promo_cards = soup.find_all('div', class_='card-promo')
        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Electronic City.")
        
        for card in promo_cards:
            try:
                title_element = card.find('div', class_='ft-sz-13')
                date_element = card.find('div', 'ft-sz-12')
                link_element = card.find('a')
                title = title_element.get_text(strip=True) if title_element else "No Title"
                details = date_element.get_text(strip=True) if date_element else "No Details"
                promo_url = "https://eci.id" + link_element['href'] if link_element and 'href' in link_element.attrs else "#"
                promo_data = {"competitor": "Electronic City", "title": title, "startDate": "", "endDate": "", "details": details, "url": promo_url}
                promotions.append(promo_data)
            except Exception: continue
            
    except Exception as e:
        print(f"Error saat navigasi atau mem-parsing Electronic City: {e}")
    finally:
        driver.quit()
        
    return promotions

# ==============================================================================
# EKSEKUSI UTAMA
# ==============================================================================
if __name__ == "__main__":
    all_promotions = []
    
    hartono_promos = scrape_hartono()
    all_promotions.extend(hartono_promos)

    electronic_city_promos = scrape_electronic_city()
    all_promotions.extend(electronic_city_promos)

    output_file = 'promotions.json'
    with open(output_file, 'w') as f:
        json.dump(all_promotions, f, indent=4)
        
    print(f"\nScraping Selesai. Data disimpan ke {output_file}")
    print(f"Total promosi yang berhasil di-parse: {len(all_promotions)}")
