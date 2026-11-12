from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root.parent)));Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/{root.name}/'
out=root.parent/'dks-review-artifacts';out.mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(permissions=['clipboard-read','clipboard-write']);p=context.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 for width in [360,390,430,768,1366]:
  p.set_viewport_size({'width':width,'height':900})
  for page in ['index','portfolio','packages','quote','contact','privacy','review','booking']:
   p.goto(base+page+'.html');p.wait_for_timeout(80)
   assert p.locator('#primary-nav a').all_text_contents()==['Home','Portfolio','Prices','Contact']
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,page,'overflow')
   if page in ['index','contact','quote','privacy','portfolio','packages'] and width in [390,1366]:
    p.evaluate('async()=>{for(const im of document.images){im.loading="eager";} await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));}');assert p.locator('img[src]').evaluate_all('(els)=>els.every(im=>im.naturalWidth>0)');p.screenshot(path=str(out/f'usability-{page}-{width}.png'),full_page=True)
  print('Layout checks',width,flush=True)
 p.goto(base+'packages.html')
 package_links=p.locator('main a[href*="packageIndex"]').evaluate_all('(els)=>els.map(e=>e.href)')
 assert len(package_links)==28
 for link in package_links:
  p.goto(link);assert p.locator('.package-option[aria-pressed=true]').count()==1
  assert 'estimate=' in p.locator('#qcontact').get_attribute('href')
 print('All 28 package links passed',flush=True)
 p.goto(base+'quote.html')
 for one,ret,fee in [(0,0,0),(5,10,0),(10,20,0),(10.5,21,4),(15,30,40),(20,40,80),(30,60,160),(10.555,21.11,4.44)]:
  p.locator('#qdistance').fill(str(one));assert p.locator('#travel-distance').inner_text()==f'{ret} km'
  got=float(p.locator('#qtravel').inner_text().replace('R','').replace('\xa0','').replace(',','.'))
  assert got==fee,(one,got)
  total=float(p.locator('#qtotal').inner_text().replace('R','').replace('\xa0','').replace(',','.'))
  deposit=float(p.locator('#qdeposit').inner_text().replace('R','').replace('\xa0','').replace(',','.'));balance=float(p.locator('#qbalance').inner_text().replace('R','').replace('\xa0','').replace(',','.'))
  assert round(deposit+balance,2)==total
 p.locator('#qdistance').fill('-1');assert p.locator('#qtotal').inner_text()=='—'
 p.locator('#qdistance').fill('');p.locator('#qdistance').press('e');assert p.locator('#qtotal').inner_text()=='—'
 p.locator('#qdistance').fill('');assert 'excluded' in p.locator('#distance-error').inner_text()
 p.goto(base+'quote.html?qdistance=40');assert p.locator('#qdistance').input_value()=='20';assert p.locator('#qtravel').inner_text()=='R80,00'
 p.goto(base+'quote.html?qdistance=20&distanceMode=oneway');assert p.locator('#qtravel').inner_text()=='R80,00'
 p.locator('#qcopy').click();p.wait_for_timeout(150);assert 'copied' in p.locator('#quote-status').inner_text()
 p.locator('#qcontact').click();p.wait_for_load_state();assert 'Travel fee: R80,00' in p.locator('#selected-estimate').input_value()
 p.locator('#name').fill('Example Client');p.locator('#phone').fill('071 000 0000');p.locator('#message').fill('Please confirm availability & pricing.');p.locator('[name=consent]').check()
 p.locator('#contact-form [type=submit]').click();assert p.locator('#enquiry-drafts').is_visible()
 mail=p.locator('#email-fallback').get_attribute('href');assert mail.startswith('mailto:dksphotography1@gmail.com?')
 mb=parse_qs(urlparse(mail).query)['body'][0];wb=parse_qs(urlparse(p.locator('#enquiry-whatsapp').get_attribute('href')).query)['text'][0]
 assert mb==wb and 'R80,00' in mb and 'Estimated total' in mb and 'privacy.html' not in mb and 'Status:' not in mb
 p.locator('#copy-enquiry').click();p.wait_for_timeout(150);assert p.evaluate('navigator.clipboard.readText()')==mb
 p.locator('#enquiry-estimate summary').click();p.locator('#edit-package').click();p.wait_for_load_state();p.locator('#qdistance').fill('15');p.locator('#qcontact').click();p.wait_for_timeout(500)
 assert p.locator('#name').input_value()=='Example Client';assert p.locator('#phone').input_value()=='071 000 0000';assert 'Travel fee: R40,00' in p.locator('#selected-estimate').input_value()
 p.goto(base+'contact.html');p.locator('#name').fill('Example Client');p.locator('#message').fill('A sample enquiry only.');p.locator('#contact-form [type=submit]').click();assert not p.locator('#enquiry-drafts').is_visible();assert not p.locator('#email').evaluate('(e)=>e.validity.valid')
 p.goto(base+'privacy.html');assert p.locator('[name=promotion]:checked').count()==0
 p.locator('#consent-name').fill('Example Client');p.locator('#consent-booking').fill('EXAMPLE-ONLY');p.locator('[name=representedPerson][value=Myself]').check();p.locator('[name=acknowledgement]').check()
 for choice in ['No','Yes, for the channels I select','Please ask me about specific photographs first']:
  p.locator('[name=promotion]').filter().evaluate_all('(els,choice)=>els.find(e=>e.value===choice).click()',choice)
  if choice.startswith('Yes'):
   assert p.locator('#consent-channels').is_visible();p.locator('[name=channel]').first.check();p.locator('#consent-restrictions').fill('Exclude close-ups');p.locator('#consent-expiry').fill('2027-01-01')
  p.locator('[data-channel=email]').click();record=p.locator('#consent-record-text').input_value();assert choice in record and '2026-11-10' in record
  assert parse_qs(urlparse(p.locator('#consent-email').get_attribute('href')).query)['body'][0]==record
  assert 'Please press Send' in p.locator('#consent-status').inner_text()
 p.locator('[name=representedPerson]').last.check();assert p.locator('#child-authority').is_visible();p.locator('#child-name').fill('Child in example booking');p.locator('#adult-authority').fill('Parent with legal authority');p.locator('[data-channel=email]').click();assert 'Parent with legal authority' in p.locator('#consent-record-text').input_value()
 p.locator('[name=representedPerson]').first.check();assert p.locator('#child-name').input_value()==''
 p.set_viewport_size({'width':390,'height':844});p.goto(base+'contact.html');p.locator('.menu-toggle').click();assert p.locator('.menu-toggle').get_attribute('aria-expanded')=='true';p.keyboard.press('Escape');assert p.locator('.menu-toggle').get_attribute('aria-expanded')=='false'
 p.goto(base+'portfolio.html');p.locator('.photo-open').first.click();assert p.locator('.photo-viewer').is_visible();p.keyboard.press('ArrowRight');p.keyboard.press('Escape');assert not p.locator('.photo-viewer').is_visible()
 assert not errors,errors
 print('PASS travel cases, old/new URLs, package handoff/edit preservation, phone-only enquiry, email/WhatsApp/copy parity, consent states, menu and viewer; zero JS errors')
 browser.close()
server.shutdown()
