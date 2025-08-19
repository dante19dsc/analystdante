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
# FUNGSI PARSING TANGGAL - SEKARANG MENDUKUNG 3 FORMAT
# ==============================================================================
def parse_promo_date(date_text, competitor):
    try:
        if competitor == "Hartono":
            cleaned_text = date_text.replace("Periode Promo:", "").strip()
            if ' - ' in cleaned_text:
                start_str, end_str = cleaned_text.split(' - ')
                end_date_obj = datetime.strptime(end_str.replace(",", ""), "%b %d %Y")
                if len(start_str.split()) == 1:
                    start_date_obj = end_date_obj.replace(day=int(start_str.replace(",", "")))
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

        elif competitor == "Electronic City":
            # Format: "Masa berlaku 17 - 18 August 2025"
            cleaned_text = date_text.replace("Masa berlaku ", "").strip()
            parts = cleaned_text.split(' ')
            start_day = parts[0]
            end_day = parts[2]
            month_id = parts[3]
            year_str = parts[4]
            # Konversi bulan dari Bahasa Indonesia ke Bahasa Inggris jika perlu
            month_map_id_to_en = {
                'januari': 'January', 'februari': 'February', 'maret': 'March', 'april': 'April', 
                'mei': 'May', 'juni': 'June', 'juli': 'July', 'agustus': 'August', 
                'september': 'September', 'oktober': 'October', 'november': 'November', 'desember': 'December'
            }
            month_en = month_map_id_to_en.get(month_id.lower(), month_id)

            start_date_obj = datetime.strptime(f"{start_day} {month_en} {year_str}", "%d %B %Y")
            end_date_obj = datetime.strptime(f"{end_day} {month_en} {year_str}", "%d %B %Y")
            return start_date_obj.strftime("%Y-%m-%d"), end_date_obj.strftime("%Y-%m-%d")
            
        return "", ""
    except Exception:
        return "", ""

# ==============================================================================
# SCRAPER HARTONO
# ==============================================================================
def scrape_hartono():
    print("\n--- Memulai Scrape Hartono ---")
    service = Service() 
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
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
            promo_url = link_element['href']
            start_date, end_date = parse_promo_date(date_range_text, "Hartono")
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
    driver = uc.Chrome(options=options)
    url = "https://www.eci.id/promo"
    print(f"Mengunjungi URL: {url}...")
    promotions = []
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 30)
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "card-promo")))
        time.sleep(3)
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')
        promo_cards = soup.find_all('div', class_='card-promo')
        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Electronic City.")
        for card in promo_cards:
            try:
                title = card.find('div', class_='ft-sz-13').get_text(strip=True)
                details = card.find('div', class_='ft-sz-12').get_text(strip=True)
                promo_url = "https://eci.id" + card.find('a')['href']
                start_date, end_date = parse_promo_date(details, "Electronic City")
                promo_data = {"competitor": "Electronic City", "title": title, "startDate": start_date, "endDate": end_date, "details": details, "url": promo_url}
                promotions.append(promo_data)
            except Exception: continue
    except Exception as e:
        print(f"Error saat navigasi atau mem-parsing Electronic City: {e}")
    finally:
        driver.quit()
    return promotions

# ==============================================================================
# SCRAPER ERABLUE
# ==============================================================================
def scrape_erablue():
    print("\n--- Memulai Scrape Erablue ---")
    options = uc.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = uc.Chrome(options=options)
    url = "https://www.erablue.id/promosi"
    print(f"Mengunjungi URL: {url}...")
    promotions = []
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 30)
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "li.itemhv")))
        time.sleep(3)
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')
        promo_cards = soup.find_all('li', class_='itemhv')
        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Erablue.")
        for card in promo_cards:
            try:
                title = card.find('h3').get_text(strip=True)
                details = card.find('p').get_text(strip=True)
                promo_url = card.find('a')['href']
                # Erablue tidak memiliki tanggal di halaman utama, biarkan kosong
                promo_data = {"competitor": "Erablue", "title": title, "startDate": "", "endDate": "", "details": details, "url": promo_url}
                promotions.append(promo_data)
            except Exception: continue
    except Exception as e:
        print(f"Error saat navigasi atau mem-parsing Erablue: {e}")
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

    erablue_promos = scrape_erablue()
    all_promotions.extend(erablue_promos)

    output_file = 'promotions.json'
    with open(output_file, 'w') as f:
        json.dump(all_promotions, f, indent=4)
        
    print(f"\nScraping Selesai. Data disimpan ke {output_file}")
    print(f"Total promosi yang berhasil di-parse: {len(all_promotions)}")
