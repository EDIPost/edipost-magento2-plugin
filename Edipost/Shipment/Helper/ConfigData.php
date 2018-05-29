<?php

namespace Edipost\Shipment\Helper;

use Magento\Framework\App\Config\ScopeConfigInterface;

/**
 * Shipment helper for module config data.
 */

class ConfigData extends \Magento\Framework\App\Helper\AbstractHelper
{
    /**
     * Initialize dependencies.
     *
     * @var \Magento\Framework\Encryption\EncryptorInterface
     */
    protected $encryptor;


    protected $XML_BASE_PATH = 'edipost/';

    /**
     * @param \Magento\Framework\App\Helper\Context $context
     * @param \Magento\Framework\Encryption\EncryptorInterface $encryptor
     */
    public function __construct(
        \Magento\Framework\App\Helper\Context $context,
        \Magento\Framework\Encryption\EncryptorInterface $encryptor
    ) {
        parent::__construct($context);
        $this->encryptor = $encryptor;
    }

    /*
     * @return bool
     */
    public function isEnabled()
    {
        return $this->scopeConfig->isSetFlag(
            $this->getFullXmlPath('settings', 'enable'),
            ScopeConfigInterface::SCOPE_TYPE_DEFAULT
        );
    }

    /*
    * @return array
    */
    public function apiData(){
        return [
            'api_endpoint' => $this->scopeConfig->getValue(
                $this->getFullXmlPath('settings', 'api_endpoint'),
                ScopeConfigInterface::SCOPE_TYPE_DEFAULT
            ),
            'api_token' => $this->scopeConfig->getValue(
                $this->getFullXmlPath('settings', 'api_token'),
                ScopeConfigInterface::SCOPE_TYPE_DEFAULT
            ),
            'username' => $this->scopeConfig->getValue(
                $this->getFullXmlPath('settings', 'username'),
                ScopeConfigInterface::SCOPE_TYPE_DEFAULT
            ),
            'password' => $this->scopeConfig->getValue(
                $this->getFullXmlPath('settings', 'username'),
                ScopeConfigInterface::SCOPE_TYPE_DEFAULT
            )
        ];
    }

    /*
    * @return array
    */
    public function printersData(){
        return [
            'api_endpoint' => $this->scopeConfig->getValue(
                $this->getFullXmlPath('printers', 'printer'),
                ScopeConfigInterface::SCOPE_TYPE_DEFAULT
            ),
            'api_token' => $this->scopeConfig->getValue(
                $this->getFullXmlPath('printers', 'printer_rfid'),
                ScopeConfigInterface::SCOPE_TYPE_DEFAULT
            )
        ];
    }

    /*
    * @return string
    */
    private function getFullXmlPath($section = 'settings', $attr = 'enable', $xml_base_path = ''){
        if(!$xml_base_path){
            $xml_base_path = $this->XML_BASE_PATH;
        }
        return $xml_base_path . $section . '/' . $attr;
    }

    public function getShippingData(){
        return [
            'fromCountryCode' => $this->scopeConfig->getValue(
                \Magento\Shipping\Model\Config::XML_PATH_ORIGIN_COUNTRY_ID,
                ScopeConfigInterface::SCOPE_TYPE_DEFAULT,
                ''
            ),
            'fromZipCode' => $this->scopeConfig->getValue(
                \Magento\Shipping\Model\Config::XML_PATH_ORIGIN_POSTCODE,
                ScopeConfigInterface::SCOPE_TYPE_DEFAULT
            )
        ];
    }
}