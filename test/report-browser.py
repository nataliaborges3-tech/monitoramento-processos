"""Teste opcional do relatório: servidor ativo e Playwright/Chromium instalados."""
import os
import re
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright, expect
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1280,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(os.getenv('APP_URL','http://127.0.0.1:3003'))
    page.locator('#executive-report').click()
    expect(page.locator('.report-text').first).to_have_value(re.compile(r'8 processo\(s\): 6 ativo\(s\) e 2 concluído'))
    page.get_by_label('Consolidação',exact=True).fill('Equipe demonstrativa')
    page.get_by_label('Texto de 3. IMPACTO',exact=True).fill('Impacto revisado pela equipe.')
    with page.expect_download() as info:
        page.locator('#download-word').click()
    with tempfile.TemporaryDirectory() as folder:
        path=os.path.join(folder,info.value.suggested_filename)
        assert path.endswith('.docx')
        info.value.save_as(path)
        with zipfile.ZipFile(path) as archive:
            assert archive.testzip() is None
            for name in archive.namelist(): ET.fromstring(archive.read(name))
            text=archive.read('word/document.xml').decode()
            assert 'Observações da gestão' in text
            assert '5. ANÁLISE' in text
            assert 'Impacto revisado pela equipe.' in text
            assert 'Equipe demonstrativa' in text
            assert '<w:tbl>' in text
    page.locator('[data-close="report-dialog"]').click()
    page.locator('#search').fill('informatica')
    page.locator('#executive-report').click()
    expect(page.get_by_label('Referência do processo',exact=True)).to_have_value(re.compile('23000.014582'))
    expect(page.locator('#report-content')).not_to_contain_text('Renovação de contrato')
    page.set_viewport_size({'width':390,'height':844})
    expect(page.locator('#download-word')).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('[data-close="report-dialog"]').click()
    page.locator('#search').fill('inexistente')
    page.locator('#executive-report').click()
    expect(page.locator('.report-text').first).to_have_value(re.compile(r'0 processo\(s\)'))
    page.locator('[data-close="report-dialog"]').click()
    page.locator('#clear-filters').click()
    page.locator('[data-detail]').first.click()
    page.locator('#process-report').click()
    expect(page.get_by_label('Referência do processo',exact=True)).to_have_value(re.compile('Processo SEI:'))
    assert page.locator('.report-text').count()==5
    assert not errors,errors
    browser.close()
    print('PASS: relatório, filtros, estado vazio, celular e download DOCX com XML e CRC válidos.')
