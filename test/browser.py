"""Teste opcional de interface: requer Python, Playwright e Chromium.
Com o servidor iniciado: python3 test/browser.py
"""
import os
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH', '/usr/bin/chromium'), args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1050})
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.goto(os.getenv('APP_URL', 'http://127.0.0.1:3000'))
    expect(page.locator('#process-rows tr')).to_have_count(8)
    page.locator('#search').fill('informatica')
    expect(page.locator('#process-rows tr')).to_have_count(1)
    expect(page.locator('#process-rows')).to_contain_text('Aquisição de equipamentos')
    page.locator('#clear-filters').click()
    page.locator('#unit-filter').select_option('Finanças')
    page.locator('#status-filter').select_option('Concluído')
    expect(page.locator('#process-rows tr')).to_have_count(1)
    page.locator('#clear-filters').click()
    page.locator('#see-alerts').click()
    expect(page.locator('#process-rows tr')).to_have_count(4)
    page.locator('[data-view="overview"]').click()
    page.locator('#new-process').click()
    form = page.locator('#process-form')
    values = {'sei': '99999.000001/2026-01', 'subject': 'Teste funcional de cadastro', 'deadline': '2026-12-15', 'requester': 'Unidade de Teste', 'unit': 'Protocolo', 'owner': 'Pessoa Teste', 'summary': 'Resumo de teste', 'pending': 'Validar documento', 'next': 'Encaminhar para análise'}
    for key, value in values.items():
        form.locator(f'[name="{key}"]').fill(value)
    form.locator('[type="submit"]').click()
    expect(page.locator('#form-dialog')).not_to_be_visible()
    expect(page.locator('#process-rows tr')).to_have_count(9)
    page.get_by_role('button', name='99999.000001/2026-01 Teste funcional de cadastro', exact=True).click()
    expect(page.locator('#detail-dialog')).to_contain_text('Resumo de teste')
    page.locator('#edit-process').click()
    form.locator('[name="subject"]').fill('Teste funcional atualizado')
    form.locator('[type="submit"]').click()
    expect(page.locator('#detail-dialog')).to_contain_text('Teste funcional atualizado')
    page.locator('#move-process').click()
    move = page.locator('#move-form')
    move.locator('[name="unit"]').fill('Finanças')
    move.locator('[name="owner"]').fill('Nova Responsável')
    move.locator('[name="note"]').fill('Encaminhado para avaliação financeira.')
    move.locator('[type="submit"]').click()
    expect(page.locator('#detail-dialog')).to_contain_text('Nova Responsável')
    expect(page.locator('.timeline li')).to_have_count(2)
    page.locator('[data-close="detail-dialog"]').click()
    page.reload()
    expect(page.locator('#process-rows tr')).to_have_count(9)
    page.locator('#search').fill('Teste funcional atualizado')
    expect(page.locator('#process-rows')).to_contain_text('Finanças')
    with page.expect_download() as download_info:
        page.locator('#export').click()
    download = download_info.value
    with tempfile.TemporaryDirectory() as temp:
        target = os.path.join(temp, download.suggested_filename)
        download.save_as(target)
        with zipfile.ZipFile(target) as archive:
            assert archive.testzip() is None, 'Falha de CRC no XLSX'
            for name in archive.namelist():
                ET.fromstring(archive.read(name))
            sheet = archive.read('xl/worksheets/sheet1.xml').decode()
            assert 'Teste funcional atualizado' in sheet
            assert 'Aquisição de equipamentos' not in sheet, 'Exportação não respeitou filtros'
            assert 'avaliação financeira' in archive.read('xl/worksheets/sheet2.xml').decode()
    page.locator('#clear-filters').click()
    # Validação de SEI duplicado na interface.
    page.locator('#new-process').click()
    for key, value in values.items():
        form.locator(f'[name="{key}"]').fill(value)
    form.locator('[type="submit"]').click()
    expect(page.locator('#form-error')).to_contain_text('Já existe')
    page.locator('[data-close="form-dialog"]').first.click()
    page.screenshot(path='/tmp/monitora-desktop.png', full_page=True)
    page.set_viewport_size({'width': 390, 'height': 844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Página transborda no celular'
    page.screenshot(path='/tmp/monitora-mobile.png', full_page=True)
    page.locator('#new-process').click()
    expect(page.locator('#form-dialog')).to_be_visible()
    page.keyboard.press('Escape')
    assert not errors, errors
    print('PASS: pesquisa, filtros, alertas, cadastro, edição, tramitação, persistência, Excel validado, duplicidade e celular; sem erros JavaScript.')
    browser.close()
