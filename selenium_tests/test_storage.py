import json
import pathlib
import os
from selenium.webdriver.chrome.options import Options
from django.test import tag
from selenium_tests.selenium_test_base import SeleniumTestBase

URL = "http://localhost:8000/"

@tag('storage')
class TestStorage(SeleniumTestBase):
    def __init__(self, methods):
        super().__init__(methods)

    def test_if_upload_successfully(self):
        """ Test that upload file that assign correct value to input section """
        inputs = [
            {'name': 'voltage', 'value': '5'},
            {'name': 'length', 'value': '5'},
            {'name': 'r0', 'value': '5'},
            {'name': 'ra', 'value': '5'},
            {'name': 'x', 'value': '5'},
            {'name': 'force', 'value': '5'},
            {'name': 'awg', 'value': '5'},
        ]
        path = str(pathlib.Path().absolute()) + '/selenium_tests/'

        filename = 'test.json'
        with open(path + filename, 'w') as outfile:
            json.dump(inputs, outfile)

        self.driver.find_element_by_id('upload-data').send_keys(path + filename)
        variable = ["voltage", "length", "r0", "ra", "x", "force", "awg"]

        for _ in variable:
            self.assertEqual(self.driver.find_element_by_id("input-text-" + _).get_attribute('value'), '5')

        os.remove(path + filename)

    def test_if_download_successfully(self):
        """ Test that download file that contains correct information """

        self.chrome_options = Options()
        path = str(pathlib.Path().absolute())
        prefs = {"download.default_directory": path}

        self.chrome_options.add_experimental_option("prefs", prefs)
        test_value = "10"
        query_parameters = ["voltage", "length", "r0", "ra", "x", "force", "awg"]
        query_string = "?"
        for query_parameter in query_parameters:
            query_string += query_parameter + "=" + test_value + "&"
        query_string = query_string[:-1]

        self.driver.get(URL + query_string)
        self.driver.find_element_by_id("saving-data").click()
        for query_parameter in query_parameters:
            self.assertEqual(self.driver.find_element_by_id("input-text-" + query_parameter).get_attribute('value'),
                             test_value)

        with open(path + '/parameters.json') as f:
            data = json.load(f)
            for item in data:
                self.assertEqual(item['value'], test_value)

        os.remove(path + '/parameters.json')

    """
    def test_if_copy_link_successfully(self):
        self.driver.find_element_by_id("copy-link").click()
        time.sleep(2)
        text = clipboard.paste()
        self.assertEqual(URL, text)
    """